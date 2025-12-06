import { useState, useEffect } from 'react'

interface Course {
  id: number
  name?: string
  period?: string
  subject: { id: number; name: string; code?: string }
  teacher?: { id: number; firstName: string; lastName: string }
  _count?: { enrollments: number }
}

interface Subject {
  id: number
  name: string
  code?: string
}

interface Teacher {
  id: number
  firstName: string
  lastName: string
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    subjectId: 0,
    teacherId: 0,
    name: '',
    period: ''
  })

  useEffect(() => {
    loadCourses()
    loadSubjects()
    loadTeachers()
  }, [search])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const result = await window.electronAPI.courses.list({ search })
      if (result.success) {
        setCourses(result.data)
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubjects = async () => {
    try {
      const result = await window.electronAPI.subjects.list()
      if (result.success) {
        setSubjects(result.data)
      }
    } catch (error) {
      console.error('Error loading subjects:', error)
    }
  }

  const loadTeachers = async () => {
    try {
      const result = await window.electronAPI.teachers.list()
      if (result.success) {
        setTeachers(result.data)
      }
    } catch (error) {
      console.error('Error loading teachers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      subjectId: formData.subjectId,
      teacherId: formData.teacherId || undefined,
      name: formData.name || undefined,
      period: formData.period || undefined
    }

    try {
      if (editingCourse) {
        const result = await window.electronAPI.courses.update(editingCourse.id, data)
        if (result.success) {
          await loadCourses()
          closeModal()
        } else {
          alert('Error: ' + result.error)
        }
      } else {
        const result = await window.electronAPI.courses.create(data)
        if (result.success) {
          await loadCourses()
          closeModal()
        } else {
          alert('Error: ' + result.error)
        }
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      subjectId: course.subject.id,
      teacherId: course.teacher?.id || 0,
      name: course.name || '',
      period: course.period || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este curso?')) return

    try {
      const result = await window.electronAPI.courses.delete(id)
      if (result.success) {
        await loadCourses()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const openCreateModal = () => {
    setEditingCourse(null)
    setFormData({ subjectId: 0, teacherId: 0, name: '', period: '' })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCourse(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Cursos</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nuevo Curso
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiantes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No hay cursos registrados
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">
                        {course.subject.code ? `${course.subject.code} - ` : ''}{course.subject.name}
                      </td>
                      <td className="px-6 py-4 text-sm">{course.name || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">{course.period || '-'}</td>
                      <td className="px-6 py-4 text-sm">{course._count?.enrollments || 0}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
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
            <h2 className="text-2xl font-bold mb-4">
              {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Materia *</label>
                <select
                  required
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Seleccione una materia</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code ? `${subject.code} - ` : ''}{subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Profesor</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Sin asignar</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nombre del Curso</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Período</label>
                <input
                  type="text"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="ej: 2025-01, Semestre 1"
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
                  {editingCourse ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
