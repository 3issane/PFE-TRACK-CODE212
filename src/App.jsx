import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import PrivateRoute from "./routes/PrivateRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import StudentDashboard from "./pages/student/Dashboard.jsx";
import StudentTopics from "./pages/student/Topics.jsx";
import StudentReports from "./pages/student/Reports.jsx";
import StudentSchedule from "./pages/student/Schedule.jsx";
import StudentReportCheck from "./pages/student/ReportCheck.jsx";
import Dashboard from "./pages/admin/Dashboard";
import ProfessorDash from "./pages/professor/Dashboard";
import AdminTopics from "./pages/admin/Topics";
import AdminReports from "./pages/admin/Reports";
import AdminSchedule from "./pages/admin/Schedule";
import ProfessorTopics from "./pages/professor/Topics";
import ProfessorReports from "./pages/professor/Reports";
import ProfessorSchedule from "./pages/professor/Schedule";
import Profile from "./pages/admin/Profile"; // shared profile component
import Users from "./pages/admin/Users";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public-only routes: if authenticated, redirect to role dashboard */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Private routes: require auth */}
        <Route element={<PrivateRoute />}>
          <Route path="/studentdash" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/topics" element={<StudentTopics />} />
          <Route path="/student/reports" element={<StudentReports />} />
          <Route path="/student/report-check" element={<StudentReportCheck />} />
          <Route path="/student/schedule" element={<StudentSchedule />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/professor/dashboard" element={<ProfessorDash />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/topics" element={<AdminTopics />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/schedule" element={<AdminSchedule />} />
          <Route path="/professor/topics" element={<ProfessorTopics />} />
          <Route path="/professor/reports" element={<ProfessorReports />} />
          <Route path="/professor/schedule" element={<ProfessorSchedule />} />
          <Route path="/admin/profile" element={<Profile />} />
          <Route path="/professor/profile" element={<Profile />} />
          <Route path="/student/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
