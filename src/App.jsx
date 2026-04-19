import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { LangProvider } from './context/LangContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import SessionHome from './pages/SessionHome'
import WorkspaceGenerate from './pages/WorkspaceGenerate'
import WorkspacePreview from './pages/WorkspacePreview'
import WorkspaceIteration from './pages/WorkspaceIteration'
import Export from './pages/Export'

function ProtectedRoute({ children }) {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  return children
}

const router = createBrowserRouter([
  { path: '/login',                 element: <Login /> },
  { path: '/',                      element: <ProtectedRoute><SessionHome /></ProtectedRoute> },
  { path: '/workspace/generate',    element: <ProtectedRoute><WorkspaceGenerate /></ProtectedRoute> },
  { path: '/workspace/preview',     element: <ProtectedRoute><WorkspacePreview /></ProtectedRoute> },
  { path: '/workspace/iteration',   element: <ProtectedRoute><WorkspaceIteration /></ProtectedRoute> },
  { path: '/export',                element: <ProtectedRoute><Export /></ProtectedRoute> },
])

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LangProvider>
          <RouterProvider router={router} />
        </LangProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
