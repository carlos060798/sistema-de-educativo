import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

interface Stats {
  students: number
  teachers: number
  courses: number
  subjects: number
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats>({
    students: 0,
    teachers: 0,
    courses: 0,
    subjects: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [studentsRes, teachersRes, coursesRes, subjectsRes] = await Promise.all([
        window.electronAPI.students.list(),
        window.electronAPI.teachers.list(),
        window.electronAPI.courses.list(),
        window.electronAPI.subjects.list()
      ])

      setStats({
        students: studentsRes.success ? studentsRes.data.length : 0,
        teachers: teachersRes.success ? teachersRes.data.length : 0,
        courses: coursesRes.success ? coursesRes.data.length : 0,
        subjects: subjectsRes.success ? subjectsRes.data.length : 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bienvenido, {user?.username}</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Estudiantes</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.students}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Profesores</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.teachers}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Cursos</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.courses}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Materias</h3>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.subjects}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Resumen del Sistema</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Total de Estudiantes</span>
                  <span className="font-semibold text-blue-600">{stats.students}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Total de Profesores</span>
                  <span className="font-semibold text-green-600">{stats.teachers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Total de Cursos</span>
                  <span className="font-semibold text-purple-600">{stats.courses}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Total de Materias</span>
                  <span className="font-semibold text-orange-600">{stats.subjects}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Accesos Rápidos</h2>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="#/students"
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">👨‍🎓</div>
                  <div className="font-medium text-gray-700">Estudiantes</div>
                </a>
                <a
                  href="#/teachers"
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">👨‍🏫</div>
                  <div className="font-medium text-gray-700">Profesores</div>
                </a>
                <a
                  href="#/courses"
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📚</div>
                  <div className="font-medium text-gray-700">Cursos</div>
                </a>
                <a
                  href="#/grades"
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="font-medium text-gray-700">Notas</div>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
