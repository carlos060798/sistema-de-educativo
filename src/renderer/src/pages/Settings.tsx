import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

interface User {
  id: number
  username: string
  role: {
    id: number
    name: string
  }
}

interface Role {
  id: number
  name: string
}

export default function Settings() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'backup'>('general')
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: 'admin' },
    { id: 2, name: 'teacher' },
    { id: 3, name: 'viewer' }
  ])
  const [showUserModal, setShowUserModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number>(0)
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    roleId: 1
  })
  const [passwordFormData, setPasswordFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers()
    }
  }, [activeTab])

  const loadUsers = async () => {
    try {
      const result = await window.electronAPI.users.list()
      if (result.success) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingUser) {
        const result = await window.electronAPI.users.update(editingUser.id, {
          username: userFormData.username,
          roleId: userFormData.roleId
        })
        if (result.success) {
          await loadUsers()
          closeUserModal()
        } else {
          alert('Error: ' + result.error)
        }
      } else {
        if (!userFormData.password || userFormData.password.length < 6) {
          alert('La contraseña debe tener al menos 6 caracteres')
          return
        }
        const result = await window.electronAPI.users.create(userFormData)
        if (result.success) {
          await loadUsers()
          closeUserModal()
        } else {
          alert('Error: ' + result.error)
        }
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    if (passwordFormData.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      const result = await window.electronAPI.users.changePassword(
        selectedUserId,
        passwordFormData.newPassword
      )
      if (result.success) {
        alert('Contraseña cambiada exitosamente')
        closePasswordModal()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return

    try {
      const result = await window.electronAPI.users.delete(id)
      if (result.success) {
        await loadUsers()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const openCreateUserModal = () => {
    setEditingUser(null)
    setUserFormData({ username: '', password: '', roleId: 1 })
    setShowUserModal(true)
  }

  const openEditUserModal = (user: User) => {
    setEditingUser(user)
    setUserFormData({ username: user.username, password: '', roleId: user.role.id })
    setShowUserModal(true)
  }

  const openChangePasswordModal = (userId: number) => {
    setSelectedUserId(userId)
    setPasswordFormData({ newPassword: '', confirmPassword: '' })
    setShowPasswordModal(true)
  }

  const closeUserModal = () => {
    setShowUserModal(false)
    setEditingUser(null)
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setSelectedUserId(0)
  }

  const handleCreateBackup = async () => {
    try {
      const result = await window.electronAPI.database.createBackup()
      if (result.success) {
        alert(`Respaldo creado exitosamente en: ${result.data}`)
      } else {
        alert('Error al crear respaldo: ' + result.error)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleRestoreBackup = async () => {
    const backupPath = prompt('Ingrese la ruta del archivo de respaldo:')
    if (!backupPath) return

    if (!confirm('¿Está seguro de restaurar este respaldo? Esto reemplazará todos los datos actuales.')) return

    try {
      const result = await window.electronAPI.database.restoreBackup(backupPath)
      if (result.success) {
        alert('Respaldo restaurado exitosamente. La aplicación se reiniciará.')
        // Recargar la aplicación
        window.location.reload()
      } else {
        alert('Error al restaurar respaldo: ' + result.error)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
                <button
                  onClick={openCreateUserModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  + Nuevo Usuario
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                          No hay usuarios registrados
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium">{u.username}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              u.role.name === 'admin' ? 'bg-purple-100 text-purple-800' :
                              u.role.name === 'teacher' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {u.role.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => openEditUserModal(u)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => openChangePasswordModal(u.id)}
                              className="text-green-600 hover:text-green-800 mr-3"
                            >
                              Cambiar Contraseña
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
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
                  <button
                    onClick={handleCreateBackup}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Crear Respaldo
                  </button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Restaurar Respaldo</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Restaura la base de datos desde un archivo de respaldo.
                  </p>
                  <button
                    onClick={handleRestoreBackup}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
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

      {/* Modal de Usuario */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleUserSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Usuario *</label>
                <input
                  type="text"
                  required
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!editingUser && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Rol *</label>
                <select
                  required
                  value={userFormData.roleId}
                  onChange={(e) => setUserFormData({ ...userFormData, roleId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeUserModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cambio de Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Cambiar Contraseña</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nueva Contraseña *</label>
                <input
                  type="password"
                  required
                  value={passwordFormData.newPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Confirmar Contraseña *</label>
                <input
                  type="password"
                  required
                  value={passwordFormData.confirmPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
