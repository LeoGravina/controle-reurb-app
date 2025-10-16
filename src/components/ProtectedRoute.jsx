// src/components/ProtectedRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
    const { currentUser } = useAuth();
    
    // Se o usuário não estiver logado, redireciona para a página de login
    return currentUser ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;