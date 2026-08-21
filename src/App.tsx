import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import './App.css';
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded components
const Login = lazy(() => import('./pages/Login'));
const InmateDashboard = lazy(() => import('./pages/InmateDashboard'));
const SchoolDashboard = lazy(() => import('./pages/SchoolDashboard'));
const SchoolAdmins = lazy(() => import('./pages/SchoolAdmins'));
const InmateAdmins = lazy(() => import('./pages/InmateAdmins'));
const NotFound = lazy(() => import('./pages/NotFoundPage'));
const Layout = lazy(() => import('./pages/Layout'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/inmate-dashboard" element={<InmateDashboard />} />
              <Route path="/inmate-dashboard/admin" element={<InmateAdmins />} />
              <Route path="/school-dashboard" element={<SchoolDashboard />} />
              <Route path="/school-dashboard/admin" element={<SchoolAdmins />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;