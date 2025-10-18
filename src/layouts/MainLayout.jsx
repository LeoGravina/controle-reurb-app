// src/layouts/MainLayout.jsx

import { Outlet } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import App from '../pages/App';

function MainLayout() {
    const { theme, setTheme } = useAuth();

    return (
        <>
            <Header 
                theme={theme}
                setTheme={setTheme}
            />

            <div className="site-wrapper">
                <Outlet />
                <Footer />
            </div>
        </>
    );
}

export default MainLayout;