import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import StudentTopics from './pages/StudentTopics'
import StudentReports from './pages/StudentReports'
import StudentGrades from './pages/StudentGrades'
import StudentSettings from './pages/StudentSettings'
import StudentProfile from './pages/StudentProfile'
import StudentSchedule from './pages/StudentSchedule'
import PrivateRoute from './components/PrivateRoute'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard/student" element={<StudentDashboard />} />
              <Route path="/dashboard/student/topics" element={<StudentTopics />} />
              <Route path="/dashboard/student/reports" element={<StudentReports />} />
              <Route path="/dashboard/student/grades" element={<StudentGrades />} />
              <Route path="/dashboard/student/schedule" element={<StudentSchedule />} />
              <Route path="/dashboard/student/profile" element={<StudentProfile />} />
              <Route path="/dashboard/student/settings" element={<StudentSettings />} />
            </Route>
          </Routes>
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  )
}

export default App
