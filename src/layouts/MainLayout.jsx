// src/layouts/MainLayout.jsx

import { Outlet } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext'; // Precisamos do useAuth para o tema

function MainLayout() {
    const { theme, setTheme } = useAuth(); // Puxa o tema do contexto

    return (
        <>
            <Header 
                theme={theme}
                setTheme={setTheme}
            />

            <Outlet />
        </>
    );
}

export default MainLayout;