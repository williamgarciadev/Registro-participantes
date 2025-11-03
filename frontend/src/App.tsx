import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ParticipantesPage from './pages/ParticipantesPage'
import NuevoParticipantePage from './pages/NuevoParticipantePage'
import EditarParticipantePage from './pages/EditarParticipantePage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminUserRolesPage from './pages/AdminUserRolesPage'
import AdminRolesPage from './pages/AdminRolesPage'
import AdminPermissionsPage from './pages/AdminPermissionsPage'
import LoginPage from './pages/LoginPage'
import LoginPreview from './pages/LoginPreview'

function App() {
  return (
    <>
      <Routes>
        {/* Ruta de login funcional */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Ruta temporal para preview del diseño del login */}
        <Route path="/login-preview" element={<LoginPreview />} />
        
        {/* Rutas normales con Layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/participantes" element={<ParticipantesPage />} />
              <Route path="/participantes/nuevo" element={<NuevoParticipantePage />} />
              <Route path="/participantes/:id/editar" element={<EditarParticipantePage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/users/:userId/roles" element={<AdminUserRolesPage />} />
              <Route path="/admin/roles" element={<AdminRolesPage />} />
              <Route path="/admin/permisos" element={<AdminPermissionsPage />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </>
  )
}

export default App
