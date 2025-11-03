import { ReactNode, useState, useEffect, useMemo, useCallback, FormEvent } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Users, Home, Menu, Search, Bell, UserCircle, LogOut } from 'lucide-react'
import PageHeaderContext, { PageHeaderState } from './PageHeaderContext'
import { useAuth } from './AuthProvider'

interface LayoutProps {
  children?: ReactNode
}

interface NavItem {
  label: string
  to: string
  description: string
  isActive: (path: string) => boolean
  icon: typeof Home
}

const navItems: NavItem[] = [
  {
    label: 'Inicio',
    to: '/',
    description: 'Resumen general del sistema',
    isActive: (path) => path === '/',
    icon: Home,
  },
  {
    label: 'Participantes',
    to: '/participantes',
    description: 'Gestion de inscripciones y asistencia',
    isActive: (path) => path.startsWith('/participantes'),
    icon: Users,
  },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, logout } = useAuth()

  const defaultHeader: PageHeaderState = useMemo(() => {
    const activeItem = navItems.find((item) => item.isActive(location.pathname))
    if (activeItem) {
      return {
        title: activeItem.label,
        subtitle: activeItem.description,
        actions: null,
      }
    }

    return {
      title: 'Panel principal',
      subtitle: 'Administracion del sistema',
      actions: null,
    }
  }, [location.pathname])

  const [header, setHeaderState] = useState<PageHeaderState>(defaultHeader)

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    setHeaderState(defaultHeader)
  }, [defaultHeader])

  const setHeader = useCallback((nextHeader: PageHeaderState) => {
    setHeaderState({
      title: nextHeader.title,
      subtitle: nextHeader.subtitle,
      actions: nextHeader.actions ?? null,
    })
  }, [])

  const resetHeader = useCallback(() => {
    setHeaderState(defaultHeader)
  }, [defaultHeader])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const content = children ?? <Outlet />
  const displayName = user?.full_name?.trim() ? user.full_name : user?.email ?? 'Usuario'
  const roleLabel = user?.is_superuser ? 'Superadministrador' : user?.roles?.[0] ?? 'Usuario'

  return (
    <PageHeaderContext.Provider value={{ header, setHeader, resetHeader }}>
      <div className="dashboard-shell">
        <aside
          id="dashboard-sidebar"
          className={`dashboard-sidebar ${isSidebarOpen ? 'is-open' : ''}`}
          aria-label="Menu principal"
        >
          <div className="dashboard-sidebar__header">
            <span className="dashboard-sidebar__logo" aria-hidden="true">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <Link to="/" className="dashboard-sidebar__brand">
                Registro de Participantes
              </Link>
              <div className="dashboard-sidebar__badge">Panel administrativo</div>
            </div>
          </div>

          <nav className="dashboard-sidebar__nav" aria-label="Navegacion principal">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = item.isActive(location.pathname)

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`dashboard-nav-link ${active ? 'dashboard-nav-link--active' : ''}`}
                >
                  <span className="dashboard-nav-link__icon" aria-hidden="true">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="dashboard-sidebar__footer" aria-live="polite">
            <span>Sesion activa como {roleLabel}</span>
            <span>{displayName}</span>
            <span>Version 1.2.0</span>
          </div>
        </aside>

        <div
          className={`dashboard-overlay ${isSidebarOpen ? 'is-visible' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden={!isSidebarOpen}
        />

        <div className="dashboard-content">
          <header className="dashboard-topbar">
            <div className="dashboard-topbar__left">
              <button
                type="button"
                className="dashboard-topbar__toggle"
                onClick={() => setIsSidebarOpen((open) => !open)}
                aria-label="Alternar menu lateral"
                aria-controls="dashboard-sidebar"
                aria-expanded={isSidebarOpen}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="dashboard-topbar__heading">
                <span className="dashboard-topbar__title">{header.title}</span>
                {header.subtitle && <span className="dashboard-topbar__subtitle">{header.subtitle}</span>}
              </div>
            </div>

            <div className="dashboard-topbar__right">
              <form className="dashboard-search" role="search" onSubmit={handleSearch}>
                <Search className="dashboard-search__icon h-4 w-4" aria-hidden="true" />
                <input type="search" placeholder="Buscar en el panel..." aria-label="Buscar en el panel" />
              </form>

              <div className="dashboard-topbar__actions">
                {header.actions}
                <button type="button" className="dashboard-topbar__toggle" aria-label="Ver notificaciones">
                  <Bell className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="dashboard-user" role="group" aria-label="Informacion de usuario">
                  <span className="dashboard-user__avatar" aria-hidden="true">
                    <UserCircle className="h-5 w-5" />
                  </span>
                  <div className="dashboard-user__meta">
                    <span className="dashboard-user__name">{displayName}</span>
                    <span className="dashboard-user__role">{roleLabel}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="dashboard-topbar__toggle"
                  onClick={handleLogout}
                  aria-label="Cerrar sesion"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </header>

          <main className="dashboard-main" role="main">
            <div className="dashboard-main__inner">{content}</div>
          </main>

          <footer className="dashboard-footer">
            &copy; {new Date().getFullYear()} Sistema de Registro de Participantes. Todos los derechos reservados.
          </footer>
        </div>
      </div>
    </PageHeaderContext.Provider>
  )
}
