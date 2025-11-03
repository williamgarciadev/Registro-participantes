import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Plus, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { usePageHeader } from '@/components/PageHeaderContext'

export default function HomePage() {
  const { setHeader, resetHeader } = usePageHeader()

  useEffect(() => {
    setHeader({
      title: 'Panel principal',
      subtitle: 'Resumen general del sistema',
      actions: (
        <Link to="/participantes/nuevo" className="btn btn-primary hidden sm:inline-flex">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Registrar participante
        </Link>
      ),
    })

    return () => {
      resetHeader()
    }
  }, [resetHeader, setHeader])

  return (
    <div className="space-y-6 pb-8">
      <section className="card animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-left md:max-w-3xl">
            <h1 className="heading-1 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Sistema de registro de participantes
            </h1>
            <p className="text-secondary mt-2 text-lg leading-relaxed">
              Administra inscripciones, asistencia y gestiona la información clave de tus eventos desde un
              panel centralizado, con una experiencia moderna basada en React y desplegada sobre infraestructura
              serverless en AWS.
            </p>
          </div>
          <Link to="/participantes" className="btn btn-secondary group">
            <Users className="h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true" />
            Ver participantes
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <span className="stat-card__icon stat-card__icon--primary">
            <Users className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-text-primary">Gestión centralizada</h3>
          <p className="mt-2 text-sm text-secondary">
            Visualiza y controla el estado de cada participante con herramientas de filtrado y búsqueda avanzada.
          </p>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '200ms' }}>
          <span className="stat-card__icon stat-card__icon--success">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-text-primary">Flujos optimizados</h3>
          <p className="mt-2 text-sm text-secondary">
            Formularios claros y procesos asistidos para registrar, editar o reactivar participantes en segundos.
          </p>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '300ms' }}>
          <span className="stat-card__icon stat-card__icon--warning">
            <Search className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-text-primary">Búsqueda inteligente</h3>
          <p className="mt-2 text-sm text-secondary">
            Encuentra participantes por nombre, correo o estado y navega resultados con paginación fluida.
          </p>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '400ms' }}>
          <span className="stat-card__icon stat-card__icon--primary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-text-primary">Arquitectura segura</h3>
          <p className="mt-2 text-sm text-secondary">
            Construido sobre AWS Lambda, API Gateway y Aurora Serverless para escalar bajo demanda con seguridad.
          </p>
        </div>
      </section>

      <section className="card animate-scale-in" style={{ animationDelay: '500ms' }}>
        <h2 className="heading-2">Stack tecnológico</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="p-6 rounded-lg bg-gradient-to-br from-primary-50 to-neutral-50 border border-primary-100">
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <span className="text-primary-600">⚙️</span> Backend
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-secondary">
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> Python + FastAPI
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> AWS Lambda y API Gateway
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> Aurora Serverless v2 (PostgreSQL)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> Infraestructura como código con SAM
              </li>
            </ul>
          </div>
          <div className="p-6 rounded-lg bg-gradient-to-br from-success-50 to-neutral-50 border border-success-100">
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <span className="text-success-600">🎨</span> Frontend
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-secondary">
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> React 18 + TypeScript
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> Vite y React Query
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> TailwindCSS y sistema de tokens de diseño
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> Despliegue en S3 + CloudFront
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
