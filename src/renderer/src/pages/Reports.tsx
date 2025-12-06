export default function Reports() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Reportes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Reportes de Estudiantes</h2>
          <p className="text-gray-600 mb-4">
            Genera reportes individuales de estudiantes con sus calificaciones y progreso.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Generar Reporte
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Reportes de Cursos</h2>
          <p className="text-gray-600 mb-4">
            Lista de estudiantes inscritos en cada curso con sus calificaciones.
          </p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Generar Reporte
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Exportar a PDF</h2>
          <p className="text-gray-600 mb-4">
            Exporta boletines de calificaciones y reportes en formato PDF.
          </p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Exportar PDF
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Exportar a Excel</h2>
          <p className="text-gray-600 mb-4">
            Exporta datos de estudiantes, profesores y calificaciones a Excel.
          </p>
          <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium text-yellow-800">Funcionalidad en desarrollo</p>
            <p className="text-sm text-yellow-700 mt-1">
              La generación y exportación de reportes estará disponible próximamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
