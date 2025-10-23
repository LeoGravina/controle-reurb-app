// src/layouts/MainLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';

function MainLayout() {
    return (
        <div className="site-wrapper"> 
            <Outlet />
            <Footer />
        </div>
    );
}

export default MainLayout;