import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Shell } from '@/components/layout/Shell';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Dashboard } from '@/pages/Dashboard';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { Connections } from '@/pages/Connections';
import { OAuthAuthorize } from '@/pages/OAuthAuthorize';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/oauth/authorize" element={<OAuthAuthorize />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/connections" 
              element={
                <ProtectedRoute>
                  <Connections />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/projects/:id" 
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Shell>
      </AuthProvider>
    </BrowserRouter>
  );
}
