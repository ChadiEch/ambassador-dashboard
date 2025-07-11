import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import LeaderDashboard from './pages/LeaderDashboard';
import AmbassadorDashboard from './pages/AmbassadorDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminFeedback from './pages/AdminFeedback';
import AdminModeration from './pages/AdminModeration';
import AdminExport from './pages/AdminExport';
import AdminUsers from './pages/AdminUsers';
import AdminTeams from './pages/AdminTeams';
import AdminRules from './pages/AdminRules';
import Rules from './pages/Rules';    
import NotesPage from './pages/MyNotes';
import InactiveUsers from './pages/InactiveUsers';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/rules" element={<Rules />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
          <Route path="/admin/inactive-users" 
          element={
           <ProtectedRoute allowedRoles={['admin']}>
          <InactiveUsers />
          </ProtectedRoute>
          }
           />

        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminModeration />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/rules" element={<AdminRules />} />
        <Route
          path="/admin/export"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminExport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teams"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTeams />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leader"
          element={
            <ProtectedRoute allowedRoles={['leader']}>
              <LeaderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/MyNotes"
  element={
    <ProtectedRoute allowedRoles={['ambassador', 'leader']}>
      <NotesPage />
    </ProtectedRoute>
  }
/>

        <Route
          path="/ambassador"
          element={
            <ProtectedRoute allowedRoles={['ambassador']}>
              <AmbassadorDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
