import { useState, useEffect } from 'react'

interface Enrollment {
  id: number
  student: {
    id: number
    firstName: string
    lastName: string
    studentCode?: string
  }
  course: {
    id: number
    name?: string
    period?: string
    subject: {
      name: string
      code?: string
    }
    teacher?: {
      firstName: string
      lastName: string
    }
  }
  enrolledAt: string
  status: string
}

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
    name: string
    code?: string
  }
}

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    studentId: 0,
    courseId: 0
  })

  useEffect(() => {
    loadEnrollments()
    loadStudents()
    loadCourses()
  }, [])

  const loadEnrollments = async () => {
    setLoading(true)
    try {
      // Obtener todos los cursos y sus inscripciones
      const coursesResult = await window.electronAPI.courses.list()
      if (coursesResult.success) {
        const allEnrollments: Enrollment[] = []

        for (const course of coursesResult.data) {
          const enrollmentsResult = await window.electronAPI.courses.getEnrollments(course.id)
          if (enrollmentsResult.success) {
            allEnrollments.push(...enrollmentsResult.data)
          }
        }

        setEnrollments(allEnrollments)
      }
    } catch (error) {
      console.error('Error loading enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      const result = await window.electronAPI.students.list()
      if (result.success) {
        setStudents(result.data.filter((s: Student) => s.status === 'active'))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.studentId === 0 || formData.courseId === 0) {
      alert('Por favor seleccione un estudiante y un curso')
      return
    }

    try {
      const result = await window.electronAPI.enrollments.create({
        studentId: formData.studentId,
        courseId: formData.courseId
      })

      if (result.success) {
        await loadEnrollments()
        closeModal()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta inscripción?')) return

    try {
      const result = await window.electronAPI.enrollments.delete(id)
      if (result.success) {
        await loadEnrollments()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const openCreateModal = () => {
    setFormData({ studentId: 0, courseId: 0 })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inscripciones</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nueva Inscripción
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No hay inscripciones registradas
                    </td>
                  </tr>
                ) : (
                  enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{enrollment.student.studentCode || '-'}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {enrollment.student.firstName} {enrollment.student.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm">{enrollment.course.name || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {enrollment.course.subject.code ? `${enrollment.course.subject.code} - ` : ''}
                        {enrollment.course.subject.name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {enrollment.course.teacher
                          ? `${enrollment.course.teacher.firstName} ${enrollment.course.teacher.lastName}`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">{enrollment.course.period || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          enrollment.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {enrollment.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(enrollment.id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Nueva Inscripción</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Estudiante *</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
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

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Curso *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: parseInt(e.target.value) })}
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
                  Inscribir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
