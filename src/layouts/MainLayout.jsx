// src/layouts/MainLayout.jsx

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const FASES = [
    "Pendente de Instruções", "Instauração", "Notificação e Buscas",
    "Análise Sócio-Econômica", "Urbanismo", "Ambiental", "Jurídico",
    "Cartório", "Titulação", "Finalizado", "Indeferido"
];

function MainLayout() {
    const { theme, setTheme } = useAuth(); // Pega o tema do contexto
    const [busca, setBusca] = useState('');
    const [filtroFase, setFiltroFase] = useState('todas');
    const [ordenacao, setOrdenacao] = useState('nome_asc');
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    return (
        <>
            <Header 
                busca={busca}
                onBuscaChange={setBusca}
                filtroFase={filtroFase}
                onFiltroFaseChange={setFiltroFase}
                ordenacao={ordenacao}
                onOrdenacaoChange={setOrdenacao}
                onAbrirModal={() => setAddModalOpen(true)}
                fases={FASES}
                theme={theme}
                setTheme={setTheme}
            />

            {/* O Outlet passa os estados de filtro como contexto para a página filha */}
            <Outlet context={{ busca, filtroFase, ordenacao, isAddModalOpen, setAddModalOpen, FASES }} />

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