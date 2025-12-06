import { useState, useEffect } from 'react'

interface Grade {
  id: number
  score: number
  maxScore: number
  weight: number
  period?: string
  gradeType?: string
  notes?: string
  enrollment: {
    id: number
    student: {
      firstName: string
      lastName: string
    }
    course: {
      subject: {
        name: string
        code?: string
      }
    }
  }
}

interface Enrollment {
  id: number
  student: {
    firstName: string
    lastName: string
    studentCode?: string
  }
  course: {
    subject: {
      name: string
      code?: string
    }
    period?: string
  }
}

export default function Grades() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [formData, setFormData] = useState({
    enrollmentId: 0,
    score: '',
    maxScore: '100',
    weight: '1',
    period: '',
    gradeType: '',
    notes: ''
  })

  useEffect(() => {
    loadGrades()
    loadEnrollments()
  }, [])

  const loadGrades = async () => {
    setLoading(true)
    try {
      const result = await window.electronAPI.grades.list()
      if (result.success) {
        setGrades(result.data)
      }
    } catch (error) {
      console.error('Error loading grades:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEnrollments = async () => {
    try {
      const coursesResult = await window.electronAPI.courses.list()
      if (coursesResult.success) {
        const allEnrollments: Enrollment[] = []

        for (const course of coursesResult.data) {
          const enrollmentsResult = await window.electronAPI.courses.getEnrollments(course.id)
          if (enrollmentsResult.success) {
            allEnrollments.push(...enrollmentsResult.data.filter((e: Enrollment) => e.status === 'active'))
          }
        }

        setEnrollments(allEnrollments)
      }
    } catch (error) {
      console.error('Error loading enrollments:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      enrollmentId: formData.enrollmentId,
      score: parseFloat(formData.score),
      maxScore: parseFloat(formData.maxScore),
      weight: parseFloat(formData.weight),
      period: formData.period || undefined,
      gradeType: formData.gradeType || undefined,
      notes: formData.notes || undefined
    }

    try {
      if (editingGrade) {
        const result = await window.electronAPI.grades.update(editingGrade.id, data)
        if (result.success) {
          await loadGrades()
          closeModal()
        } else {
          alert('Error: ' + result.error)
        }
      } else {
        const result = await window.electronAPI.grades.create(data)
        if (result.success) {
          await loadGrades()
          closeModal()
        } else {
          alert('Error: ' + result.error)
        }
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade)
    setFormData({
      enrollmentId: grade.enrollment.id,
      score: grade.score.toString(),
      maxScore: grade.maxScore.toString(),
      weight: grade.weight.toString(),
      period: grade.period || '',
      gradeType: grade.gradeType || '',
      notes: grade.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta nota?')) return

    try {
      const result = await window.electronAPI.grades.delete(id)
      if (result.success) {
        await loadGrades()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const openCreateModal = () => {
    setEditingGrade(null)
    setFormData({
      enrollmentId: 0,
      score: '',
      maxScore: '100',
      weight: '1',
      period: '',
      gradeType: '',
      notes: ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingGrade(null)
  }

  const getPercentage = (score: number, maxScore: number) => {
    return ((score / maxScore) * 100).toFixed(1)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Notas</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nueva Nota
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puntos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {grades.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No hay notas registradas
                    </td>
                  </tr>
                ) : (
                  grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        {grade.enrollment.student.firstName} {grade.enrollment.student.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {grade.enrollment.course.subject.code ?
                          `${grade.enrollment.course.subject.code} - ` : ''}
                        {grade.enrollment.course.subject.name}
                      </td>
                      <td className="px-6 py-4 text-sm">{grade.period || '-'}</td>
                      <td className="px-6 py-4 text-sm">{grade.gradeType || '-'}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {grade.score}/{grade.maxScore}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded ${
                          parseFloat(getPercentage(grade.score, grade.maxScore)) >= 70
                            ? 'bg-green-100 text-green-800'
                            : parseFloat(getPercentage(grade.score, grade.maxScore)) >= 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getPercentage(grade.score, grade.maxScore)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{grade.weight}x</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleEdit(grade)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(grade.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingGrade ? 'Editar Nota' : 'Nueva Nota'}
            </h2>
            <form onSubmit={handleSubmit}>
              {!editingGrade && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Estudiante - Curso *
                  </label>
                  <select
                    required
                    value={formData.enrollmentId}
                    onChange={(e) => setFormData({ ...formData, enrollmentId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Seleccione una inscripción</option>
                    {enrollments.map((enrollment) => (
                      <option key={enrollment.id} value={enrollment.id}>
                        {enrollment.student.studentCode ? `${enrollment.student.studentCode} - ` : ''}
                        {enrollment.student.firstName} {enrollment.student.lastName} | {' '}
                        {enrollment.course.subject.code ? `${enrollment.course.subject.code} - ` : ''}
                        {enrollment.course.subject.name}
                        {enrollment.course.period ? ` (${enrollment.course.period})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Puntuación *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Puntuación Máxima
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Peso
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Período
                </label>
                <input
                  type="text"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="ej: Q1, Parcial 1"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tipo de Evaluación
                </label>
                <select
                  value={formData.gradeType}
                  onChange={(e) => setFormData({ ...formData, gradeType: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="exam">Examen</option>
                  <option value="homework">Tarea</option>
                  <option value="project">Proyecto</option>
                  <option value="participation">Participación</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Comentarios adicionales..."
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingGrade ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
