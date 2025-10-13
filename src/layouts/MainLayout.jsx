// src/layouts/MainLayout.jsx

import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
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

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme}
            />
        </>
    );
}

export default MainLayout;