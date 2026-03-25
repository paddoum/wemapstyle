import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LangProvider } from './context/LangContext'
import ErrorBoundary from './components/ErrorBoundary'
import SessionHome from './pages/SessionHome'
import WorkspaceGenerate from './pages/WorkspaceGenerate'
import WorkspacePreview from './pages/WorkspacePreview'
import WorkspaceIteration from './pages/WorkspaceIteration'
import Export from './pages/Export'

const router = createBrowserRouter([
  { path: '/',                     element: <SessionHome /> },
  { path: '/workspace/generate',   element: <WorkspaceGenerate /> },
  { path: '/workspace/preview',    element: <WorkspacePreview /> },
  { path: '/workspace/iteration',  element: <WorkspaceIteration /> },
  { path: '/export',               element: <Export /> },
])

export default function App() {
  return (
    <ErrorBoundary>
      <LangProvider>
        <RouterProvider router={router} />
      </LangProvider>
    </ErrorBoundary>
  )
}
