import { Link } from 'react-router-dom'
import { Users, Plus, Search } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sistema de Registro de Participantes
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Gestiona y administra participantes de manera eficiente con nuestra plataforma
          construida con tecnología serverless en AWS.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/participantes" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ver Participantes
          </h3>
          <p className="text-gray-600">
            Consulta la lista completa de participantes registrados en el sistema
          </p>
        </Link>

        <Link to="/participantes/nuevo" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
            <Plus className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nuevo Participante
          </h3>
          <p className="text-gray-600">
            Registra un nuevo participante en el sistema de manera rápida
          </p>
        </Link>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Buscar
          </h3>
          <p className="text-gray-600">
            Encuentra participantes por nombre, apellido o correo electrónico
          </p>
        </div>
      </div>

      {/* Tech Stack Info */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Stack Tecnológico</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• Python + FastAPI</li>
              <li>• AWS Lambda</li>
              <li>• Aurora Serverless v2 (PostgreSQL)</li>
              <li>• API Gateway</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• React 18 + TypeScript</li>
              <li>• Vite</li>
              <li>• S3 + CloudFront</li>
              <li>• TailwindCSS</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
