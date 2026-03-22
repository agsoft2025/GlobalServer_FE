import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from "./context/AuthContext";

import Login from './pages/Login';
import InmateDashboard from './pages/InmateDashboard';
import SchoolDashboard from './pages/SchoolDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFoundPage';
import Layout from './pages/Layout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
            <Route path="/school-dashboard" element={<SchoolDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
