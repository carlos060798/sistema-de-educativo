import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function Settings() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'backup'>('general')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Configuración</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'backup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Respaldo
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Configuración General</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario actual
                  </label>
                  <div className="bg-gray-50 px-4 py-3 rounded-lg">
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-sm text-gray-600">Rol: {user?.role}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Institución
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mi Institución Educativa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año Escolar
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2025"
                  />
                </div>

                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Gestión de Usuarios</h2>
              <p className="text-gray-600 mb-4">
                Administra los usuarios del sistema, roles y permisos.
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Gestionar Usuarios
              </button>
            </div>
          )}

          {activeTab === 'backup' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Respaldo y Restauración</h2>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Crear Respaldo</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Crea una copia de seguridad de toda la base de datos.
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Crear Respaldo
                  </button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Restaurar Respaldo</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Restaura la base de datos desde un archivo de respaldo.
                  </p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Restaurar
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Respaldos Automáticos</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Los respaldos automáticos se crean diariamente a las 2:00 AM.
                  </p>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Activar respaldos automáticos</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
