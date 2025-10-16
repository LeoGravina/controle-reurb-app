// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importando as páginas
import App from './pages/App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminPage from './pages/AdminPage.jsx';

// Importando os componentes de rota
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx'; // Verifique se o caminho está correto

import './index.css';

// Componente para o ToastContainer que pega o tema do contexto
function GlobalToast() {
    const { theme } = useAuth();
    return <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme={theme} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas protegidas para usuários logados */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<App />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>

          {/* Rotas protegidas para administradores */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
        <GlobalToast />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);