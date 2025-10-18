// src/layouts/MainLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer'; // Importando o Footer

// Este componente agora é responsável apenas pela estrutura e pelo rodapé.
function MainLayout() {
    return (
        <div className="site-wrapper">
            {/* O Outlet renderizará o componente da rota (App, ProfilePage, etc.) */}
            <Outlet />
            <Footer />
        </div>
    );
}

export default MainLayout;