import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ParticipantesPage from './pages/ParticipantesPage'
import NuevoParticipantePage from './pages/NuevoParticipantePage'
import EditarParticipantePage from './pages/EditarParticipantePage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/participantes" element={<ParticipantesPage />} />
        <Route path="/participantes/nuevo" element={<NuevoParticipantePage />} />
        <Route path="/participantes/:id/editar" element={<EditarParticipantePage />} />
      </Routes>
    </Layout>
  )
}

export default App
