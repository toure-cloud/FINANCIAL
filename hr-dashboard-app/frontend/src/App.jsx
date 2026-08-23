import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { theme } from './themes/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardRH from './pages/dashboard/DashboardRH';
import { employeeService, formationService, depenseService } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#F5F6F8'
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid #E4E7ED',
          borderTop: '4px solid #2F6F5E',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [employees, setEmployees] = React.useState([]);
  const [formations, setFormations] = React.useState([]);
  const [depenses, setDepenses] = React.useState([]);

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [empRes, formRes, depRes] = await Promise.all([
        employeeService.getAll(),
        formationService.getAll(),
        depenseService.getAll()
      ]);

      let employeesData = [];
      if (Array.isArray(empRes.data)) {
        employeesData = empRes.data;
      } else if (empRes.data && empRes.data.results) {
        employeesData = empRes.data.results;
      }

      let formationsData = [];
      if (Array.isArray(formRes.data)) {
        formationsData = formRes.data;
      } else if (formRes.data && formRes.data.results) {
        formationsData = formRes.data.results;
      }

      let depensesData = [];
      if (Array.isArray(depRes.data)) {
        depensesData = depRes.data;
      } else if (depRes.data && depRes.data.results) {
        depensesData = depRes.data.results;
      }

      setEmployees(employeesData);
      setFormations(formationsData);
      setDepenses(depensesData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardRH
      employees={employees}
      formations={formations}
      depenses={depenses}
      loading={loading}
      onLogout={logout}
    />
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '10px',
                  padding: '16px',
                  background: '#16233D',
                  color: 'white',
                },
              }}
            />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppContent />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
