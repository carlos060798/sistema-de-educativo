import { useState, useEffect } from 'react'

interface Student {
  id: number
  firstName: string
  lastName: string
  studentCode?: string
}

interface Course {
  id: number
  name?: string
  period?: string
  subject: {
    code?: string
    name: string
  }
}

export default function Reports() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedStudent, setSelectedStudent] = useState(0)
  const [selectedCourse, setSelectedCourse] = useState(0)
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStudents()
    loadCourses()
  }, [])

  const loadStudents = async () => {
    try {
      const result = await window.electronAPI.students.list()
      if (result.success) {
        setStudents(result.data)
      }
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const loadCourses = async () => {
    try {
      const result = await window.electronAPI.courses.list()
      if (result.success) {
        setCourses(result.data)
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  const handleGenerateStudentReportPDF = async () => {
    if (selectedStudent === 0) {
      alert('Por favor seleccione un estudiante')
      return
    }

    setLoading(true)
    try {
      const reportResult = await window.electronAPI.reports.generateStudentReportCard(
        selectedStudent,
        selectedPeriod || undefined
      )

      if (reportResult.success) {
        const pdfResult = await window.electronAPI.reports.exportToPdf(reportResult.data, 'student')
        if (pdfResult.success) {
          alert(`PDF generado exitosamente en: ${pdfResult.data}`)
        } else {
          alert('Error al generar PDF: ' + pdfResult.error)
        }
      } else {
        alert('Error al obtener datos: ' + reportResult.error)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateStudentReportExcel = async () => {
    if (selectedStudent === 0) {
      alert('Por favor seleccione un estudiante')
      return
    }

    setLoading(true)
    try {
      const reportResult = await window.electronAPI.reports.generateStudentReportCard(
        selectedStudent,
        selectedPeriod || undefined
      )

      if (reportResult.success) {
        const excelResult = await window.electronAPI.reports.exportToExcel(reportResult.data, 'student')
        if (excelResult.success) {
          alert(`Excel generado exitosamente en: ${excelResult.data}`)
        } else {
          alert('Error al generar Excel: ' + excelResult.error)
        }
      } else {
        alert('Error al obtener datos: ' + reportResult.error)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCourseRosterPDF = async () => {
    if (selectedCourse === 0) {
      alert('Por favor seleccione un curso')
      return
    }

    setLoading(true)
    try {
      const rosterResult = await window.electronAPI.reports.generateCourseRoster(selectedCourse)

      if (rosterResult.success) {
        const pdfResult = await window.electronAPI.reports.exportToPdf(rosterResult.data, 'course')
        if (pdfResult.success) {
          alert(`PDF generado exitosamente en: ${pdfResult.data}`)
        } else {
          alert('Error al generar PDF: ' + pdfResult.error)
        }
      } else {
        alert('Error al obtener datos: ' + rosterResult.error)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCourseRosterExcel = async () => {
    if (selectedCourse === 0) {
      alert('Por favor seleccione un curso')
      return
    }

    setLoading(true)
    try {
      const rosterResult = await window.electronAPI.reports.generateCourseRoster(selectedCourse)

      if (rosterResult.success) {
        const excelResult = await window.electronAPI.reports.exportToExcel(rosterResult.data, 'course')
        if (excelResult.success) {
          alert(`Excel generado exitosamente en: ${excelResult.data}`)
        } else {
          alert('Error al generar Excel: ' + excelResult.error)
        }
      } else {
        alert('Error al obtener datos: ' + rosterResult.error)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Reportes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reporte de Estudiante */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Boleta de Estudiante</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Genera la boleta de calificaciones individual de un estudiante.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estudiante *
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Seleccione un estudiante</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.studentCode ? `${student.studentCode} - ` : ''}
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período (opcional)
              </label>
              <input
                type="text"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                placeholder="ej: 2025-01"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleGenerateStudentReportPDF}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'PDF'}
              </button>
              <button
                onClick={handleGenerateStudentReportExcel}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'Excel'}
              </button>
            </div>
          </div>
        </div>

        {/* Reporte de Curso */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Lista de Curso</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Genera la lista de estudiantes inscritos en un curso.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso *
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Seleccione un curso</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.subject.code ? `${course.subject.code} - ` : ''}
                    {course.subject.name}
                    {course.period ? ` (${course.period})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleGenerateCourseRosterPDF}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'PDF'}
              </button>
              <button
                onClick={handleGenerateCourseRosterExcel}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'Excel'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
