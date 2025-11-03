import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ParticipantesPage from './pages/ParticipantesPage'
import NuevoParticipantePage from './pages/NuevoParticipantePage'
import EditarParticipantePage from './pages/EditarParticipantePage'
import LoginPreview from './pages/LoginPreview'

function App() {
  return (
    <>
      <Routes>
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
            </Routes>
          </Layout>
        } />
      </Routes>
    </>
  )
}

export default App
