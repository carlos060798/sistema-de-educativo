import { ipcMain, dialog } from 'electron'
import { requireRole } from '@main/session'
import { reportService } from '@services/reportService'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'

export function setupReportHandlers() {
  // Generar boleta de estudiante
  ipcMain.handle('reports:generateStudentReportCard', async (_, studentId: number, period?: string) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const reportCard = await reportService.generateStudentReportCard(studentId, period)
      return { success: true, data: reportCard }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Generar lista de curso
  ipcMain.handle('reports:generateCourseRoster', async (_, courseId: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const roster = await reportService.generateCourseRoster(courseId)
      return { success: true, data: roster }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Exportar boleta a PDF
  ipcMain.handle('reports:exportStudentReportToPdf', async (_, reportData: any) => {
    try {
      requireRole(['admin', 'teacher'])

      const doc = new jsPDF()

      // Título
      doc.setFontSize(18)
      doc.text('SISTEMA EDUCATIVO', 105, 20, { align: 'center' })
      doc.setFontSize(14)
      doc.text('BOLETA DE CALIFICACIONES', 105, 28, { align: 'center' })

      // Información del estudiante
      doc.setFontSize(11)
      doc.text(`Estudiante: ${reportData.student.firstName} ${reportData.student.lastName}`, 20, 40)
      if (reportData.student.studentCode) {
        doc.text(`Código: ${reportData.student.studentCode}`, 20, 47)
      }
      if (reportData.period) {
        doc.text(`Período: ${reportData.period}`, 20, 54)
      }

      // Tabla de calificaciones
      const tableData = reportData.grades.map((grade: any) => [
        grade.subjectCode ? `${grade.subjectCode} - ${grade.subject}` : grade.subject,
        grade.gradeType || '-',
        `${grade.score}/${grade.maxScore}`,
        `${grade.percentage}%`,
        `${grade.weight}x`,
        grade.period || '-'
      ])

      autoTable(doc, {
        startY: 65,
        head: [['Materia', 'Tipo', 'Puntos', '%', 'Peso', 'Período']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9 }
      })

      // Promedios
      const finalY = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text(`PROMEDIO SIMPLE: ${reportData.average}%`, 20, finalY)
      doc.text(`PROMEDIO PONDERADO: ${reportData.weightedAverage}%`, 20, finalY + 8)

      // Guardar archivo
      const result = await dialog.showSaveDialog({
        title: 'Guardar Boleta PDF',
        defaultPath: `Boleta_${reportData.student.lastName}_${reportData.student.firstName}.pdf`,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      })

      if (!result.canceled && result.filePath) {
        const buffer = doc.output('arraybuffer')
        fs.writeFileSync(result.filePath, Buffer.from(buffer))
        return { success: true, data: result.filePath }
      }

      return { success: false, error: 'Operación cancelada' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Exportar lista de curso a PDF
  ipcMain.handle('reports:exportCourseRosterToPdf', async (_, rosterData: any) => {
    try {
      requireRole(['admin', 'teacher'])

      const doc = new jsPDF()

      // Título
      doc.setFontSize(18)
      doc.text('SISTEMA EDUCATIVO', 105, 20, { align: 'center' })
      doc.setFontSize(14)
      doc.text('LISTA DE CURSO', 105, 28, { align: 'center' })

      // Información del curso
      doc.setFontSize(11)
      const subjectText = rosterData.course.subject.code
        ? `${rosterData.course.subject.code} - ${rosterData.course.subject.name}`
        : rosterData.course.subject.name
      doc.text(`Materia: ${subjectText}`, 20, 40)

      if (rosterData.course.teacher) {
        doc.text(`Profesor: ${rosterData.course.teacher.firstName} ${rosterData.course.teacher.lastName}`, 20, 47)
      }
      if (rosterData.course.period) {
        doc.text(`Período: ${rosterData.course.period}`, 20, 54)
      }
      doc.text(`Total de Estudiantes: ${rosterData.students.length}`, 20, 61)

      // Tabla de estudiantes
      const tableData = rosterData.students.map((student: any, index: number) => [
        index + 1,
        student.studentCode || '-',
        `${student.lastName}, ${student.firstName}`,
        student.email || '-',
        student.status === 'active' ? 'Activo' : 'Inactivo'
      ])

      autoTable(doc, {
        startY: 70,
        head: [['#', 'Código', 'Nombre', 'Email', 'Estado']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9 }
      })

      // Guardar archivo
      const courseName = rosterData.course.name || rosterData.course.subject.name
      const result = await dialog.showSaveDialog({
        title: 'Guardar Lista PDF',
        defaultPath: `Lista_${courseName.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      })

      if (!result.canceled && result.filePath) {
        const buffer = doc.output('arraybuffer')
        fs.writeFileSync(result.filePath, Buffer.from(buffer))
        return { success: true, data: result.filePath }
      }

      return { success: false, error: 'Operación cancelada' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Exportar boleta a Excel
  ipcMain.handle('reports:exportStudentReportToExcel', async (_, reportData: any) => {
    try {
      requireRole(['admin', 'teacher'])

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Boleta de Calificaciones')

      // Configurar columnas
      worksheet.columns = [
        { header: 'Materia', key: 'subject', width: 30 },
        { header: 'Código', key: 'code', width: 12 },
        { header: 'Tipo', key: 'type', width: 15 },
        { header: 'Puntos', key: 'score', width: 12 },
        { header: 'Máximo', key: 'maxScore', width: 12 },
        { header: 'Porcentaje', key: 'percentage', width: 12 },
        { header: 'Peso', key: 'weight', width: 10 },
        { header: 'Período', key: 'period', width: 12 }
      ]

      // Título
      worksheet.mergeCells('A1:H1')
      const titleCell = worksheet.getCell('A1')
      titleCell.value = 'SISTEMA EDUCATIVO - BOLETA DE CALIFICACIONES'
      titleCell.font = { size: 16, bold: true }
      titleCell.alignment = { horizontal: 'center' }

      // Info del estudiante
      worksheet.mergeCells('A3:H3')
      const studentCell = worksheet.getCell('A3')
      studentCell.value = `Estudiante: ${reportData.student.firstName} ${reportData.student.lastName}${reportData.student.studentCode ? ` (${reportData.student.studentCode})` : ''}`
      studentCell.font = { size: 12, bold: true }

      if (reportData.period) {
        worksheet.mergeCells('A4:H4')
        const periodCell = worksheet.getCell('A4')
        periodCell.value = `Período: ${reportData.period}`
        periodCell.font = { size: 11 }
      }

      // Encabezados (fila 6)
      const headerRow = worksheet.getRow(6)
      headerRow.font = { bold: true }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2980B9' }
      }
      headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true }

      // Datos
      let rowIndex = 7
      reportData.grades.forEach((grade: any) => {
        worksheet.addRow({
          subject: grade.subject,
          code: grade.subjectCode || '-',
          type: grade.gradeType || '-',
          score: grade.score,
          maxScore: grade.maxScore,
          percentage: `${grade.percentage}%`,
          weight: `${grade.weight}x`,
          period: grade.period || '-'
        })
        rowIndex++
      })

      // Promedios
      rowIndex += 1
      worksheet.mergeCells(`A${rowIndex}:G${rowIndex}`)
      const avgCell = worksheet.getCell(`A${rowIndex}`)
      avgCell.value = `PROMEDIO SIMPLE: ${reportData.average}%`
      avgCell.font = { bold: true, size: 12 }

      rowIndex++
      worksheet.mergeCells(`A${rowIndex}:G${rowIndex}`)
      const wavgCell = worksheet.getCell(`A${rowIndex}`)
      wavgCell.value = `PROMEDIO PONDERADO: ${reportData.weightedAverage}%`
      wavgCell.font = { bold: true, size: 12 }

      // Guardar archivo
      const result = await dialog.showSaveDialog({
        title: 'Guardar Boleta Excel',
        defaultPath: `Boleta_${reportData.student.lastName}_${reportData.student.firstName}.xlsx`,
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
      })

      if (!result.canceled && result.filePath) {
        await workbook.xlsx.writeFile(result.filePath)
        return { success: true, data: result.filePath }
      }

      return { success: false, error: 'Operación cancelada' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Exportar lista de curso a Excel
  ipcMain.handle('reports:exportCourseRosterToExcel', async (_, rosterData: any) => {
    try {
      requireRole(['admin', 'teacher'])

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Lista de Curso')

      // Configurar columnas
      worksheet.columns = [
        { header: '#', key: 'number', width: 8 },
        { header: 'Código', key: 'code', width: 15 },
        { header: 'Apellido', key: 'lastName', width: 20 },
        { header: 'Nombre', key: 'firstName', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Estado', key: 'status', width: 12 }
      ]

      // Título
      worksheet.mergeCells('A1:F1')
      const titleCell = worksheet.getCell('A1')
      titleCell.value = 'SISTEMA EDUCATIVO - LISTA DE CURSO'
      titleCell.font = { size: 16, bold: true }
      titleCell.alignment = { horizontal: 'center' }

      // Info del curso
      worksheet.mergeCells('A3:F3')
      const subjectCell = worksheet.getCell('A3')
      const subjectText = rosterData.course.subject.code
        ? `${rosterData.course.subject.code} - ${rosterData.course.subject.name}`
        : rosterData.course.subject.name
      subjectCell.value = `Materia: ${subjectText}`
      subjectCell.font = { size: 12, bold: true }

      if (rosterData.course.teacher) {
        worksheet.mergeCells('A4:F4')
        const teacherCell = worksheet.getCell('A4')
        teacherCell.value = `Profesor: ${rosterData.course.teacher.firstName} ${rosterData.course.teacher.lastName}`
        teacherCell.font = { size: 11 }
      }

      if (rosterData.course.period) {
        const periodRow = rosterData.course.teacher ? 5 : 4
        worksheet.mergeCells(`A${periodRow}:F${periodRow}`)
        const periodCell = worksheet.getCell(`A${periodRow}`)
        periodCell.value = `Período: ${rosterData.course.period}`
        periodCell.font = { size: 11 }
      }

      // Encabezados
      const headerRow = worksheet.getRow(7)
      headerRow.font = { bold: true }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2980B9' }
      }
      headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true }

      // Datos
      rosterData.students.forEach((student: any, index: number) => {
        worksheet.addRow({
          number: index + 1,
          code: student.studentCode || '-',
          lastName: student.lastName,
          firstName: student.firstName,
          email: student.email || '-',
          status: student.status === 'active' ? 'Activo' : 'Inactivo'
        })
      })

      // Total
      const totalRow = worksheet.rowCount + 2
      worksheet.mergeCells(`A${totalRow}:E${totalRow}`)
      const totalCell = worksheet.getCell(`A${totalRow}`)
      totalCell.value = `TOTAL DE ESTUDIANTES: ${rosterData.students.length}`
      totalCell.font = { bold: true, size: 12 }

      // Guardar archivo
      const courseName = rosterData.course.name || rosterData.course.subject.name
      const result = await dialog.showSaveDialog({
        title: 'Guardar Lista Excel',
        defaultPath: `Lista_${courseName.replace(/[^a-z0-9]/gi, '_')}.xlsx`,
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
      })

      if (!result.canceled && result.filePath) {
        await workbook.xlsx.writeFile(result.filePath)
        return { success: true, data: result.filePath }
      }

      return { success: false, error: 'Operación cancelada' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Obtener estadísticas del sistema
  ipcMain.handle('reports:getSystemStatistics', async () => {
    try {
      requireRole(['admin', 'viewer'])
      const stats = await reportService.getSystemStatistics()
      return { success: true, data: stats }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
