import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isConfigured } from './lib/supabase'
import Layout from './components/Layout'
import SetupPage from './pages/SetupPage'
import Dashboard from './pages/Dashboard'
import StudentList from './pages/StudentList'
import AddStudent from './pages/AddStudent'
import Marksheet from './pages/Marksheet'
import Upload from './pages/Upload'

export default function App() {
  if (!isConfigured) return <SetupPage />
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<StudentList />} />
          <Route path="add" element={<AddStudent />} />
          <Route path="marksheet/:id" element={<Marksheet />} />
          <Route path="upload" element={<Upload />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
