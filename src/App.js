import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import LeadsList from './components/leads/LeadsList';
import LeadForm from './components/leads/LeadForm';
import PrivateRoute from './components/routing/PrivateRoute';

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Navigate to="/leads" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/leads"
                  element={
                    <PrivateRoute>
                      <LeadsList />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/leads/new"
                  element={
                    <PrivateRoute>
                      <LeadForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/leads/edit/:id"
                  element={
                    <PrivateRoute>
                      <LeadForm />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
