import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LangProvider } from './context/LangContext'
import SessionHome from './pages/SessionHome'
import WorkspaceGenerate from './pages/WorkspaceGenerate'
import WorkspacePreview from './pages/WorkspacePreview'
import WorkspaceIteration from './pages/WorkspaceIteration'
import Export from './pages/Export'

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                      element={<SessionHome />} />
          <Route path="/workspace/generate"    element={<WorkspaceGenerate />} />
          <Route path="/workspace/preview"     element={<WorkspacePreview />} />
          <Route path="/workspace/iteration"   element={<WorkspaceIteration />} />
          <Route path="/export"                element={<Export />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  )
}
