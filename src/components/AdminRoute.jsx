// src/components/AdminRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Verifique se o caminho do import está correto

function AdminRoute() {
    const { userProfile } = useAuth();

    if (!userProfile) {
        return null; 
    }

    return userProfile.role === 'admin' ? <Outlet /> : <Navigate to="/" />;
}

export default AdminRoute;