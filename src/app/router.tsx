import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../pages/login/LoginPage'
import { WorkspacePage } from '../pages/workspace'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<WorkspacePage />} />
      <Route path="*" element={<Navigate to="/objects" replace />} />
    </Routes>
  )
}
