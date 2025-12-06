import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-blue-900 text-white">
        <div className="p-4 border-b border-blue-800">
          <h1 className="text-xl font-bold">Sistema Educativo</h1>
          <p className="text-sm text-blue-200 mt-1">{user?.username}</p>
          <p className="text-xs text-blue-300">{user?.role}</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/" className="block px-4 py-2 rounded hover:bg-blue-800">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/students" className="block px-4 py-2 rounded hover:bg-blue-800">
                Estudiantes
              </Link>
            </li>
            <li>
              <Link to="/teachers" className="block px-4 py-2 rounded hover:bg-blue-800">
                Profesores
              </Link>
            </li>
            <li>
              <Link to="/subjects" className="block px-4 py-2 rounded hover:bg-blue-800">
                Materias
              </Link>
            </li>
            <li>
              <Link to="/courses" className="block px-4 py-2 rounded hover:bg-blue-800">
                Cursos
              </Link>
            </li>
            <li>
              <Link to="/enrollments" className="block px-4 py-2 rounded hover:bg-blue-800">
                Inscripciones
              </Link>
            </li>
            <li>
              <Link to="/grades" className="block px-4 py-2 rounded hover:bg-blue-800">
                Notas
              </Link>
            </li>
            <li>
              <Link to="/reports" className="block px-4 py-2 rounded hover:bg-blue-800">
                Reportes
              </Link>
            </li>
            <li>
              <Link to="/settings" className="block px-4 py-2 rounded hover:bg-blue-800">
                Configuración
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
