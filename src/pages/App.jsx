// src/pages/App.jsx

import { useState, useEffect, useMemo } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { nucleosCollection } from '../firebase/config';
import Header from '../components/Header';
import NucleosGrid from '../components/NucleosGrid';
import AddNucleoModal from '../components/AddNucleoModal';
import ManageNucleoModal from '../components/ManageNucleoModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import NucleoCardSkeleton from '../components/NucleoCardSkeleton'; // Importando o Skeleton

const FASES = [ "Pendente de Instruções", "Instauração", "Notificação e Buscas", "Análise Sócio-Econômica", "Urbanismo", "Ambiental", "Jurídico", "Cartório", "Titulação", "Finalizado", "Indeferido" ];

function App() {
    const [todosNucleos, setTodosNucleos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [filtroFase, setFiltroFase] = useState('todas');
    const [ordenacao, setOrdenacao] = useState('nome_asc');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isManageModalOpen, setManageModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedNucleo, setSelectedNucleo] = useState(null);
    const [initialModalMode, setInitialModalMode] = useState('view');
    
    // O controle de tema foi movido para o AuthContext, mas se estiver usando aqui, pode manter.
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        const userPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        return userPrefersDark ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const unsubscribe = nucleosCollection.orderBy("nome").onSnapshot(snapshot => {
            setTodosNucleos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const nucleosFiltrados = useMemo(() => {
        let nucleosProcessados = [...todosNucleos];
        if (busca) {
            const termoBusca = busca.toLowerCase().trim();
            nucleosProcessados = nucleosProcessados.filter(n => n.nome.toLowerCase().includes(termoBusca) || n.decreto.toLowerCase().includes(termoBusca));
        }
        if (filtroFase !== 'todas') {
            nucleosProcessados = nucleosProcessados.filter(n => n.fase?.nome === filtroFase);
        }
        nucleosProcessados.sort((a, b) => {
            switch (ordenacao) {
                case 'data_recente': 
                    // Tratamento para datas inválidas ou ausentes
                    const dateA = new Date(a.fase?.data || a.dataInstauracao);
                    const dateB = new Date(b.fase?.data || b.dataInstauracao);
                    if (isNaN(dateA)) return 1;
                    if (isNaN(dateB)) return -1;
                    return dateB - dateA;
                case 'nome_desc': 
                    return b.nome.localeCompare(a.nome);
                default: 
                    return a.nome.localeCompare(b.nome);
            }
        });
        return nucleosProcessados;
    }, [todosNucleos, busca, filtroFase, ordenacao]);
    
    const handleOpenManageModal = (nucleo, mode = 'view') => {
        setSelectedNucleo(nucleo);
        setInitialModalMode(mode);
        setManageModalOpen(true);
    };

    const handleOpenDeleteModal = (nucleo) => {
        setSelectedNucleo(nucleo);
        setDeleteModalOpen(true);
    };

    // --- FUNÇÃO ADICIONADA AQUI ---
    const handleLimparFiltros = () => {
        setBusca('');
        setFiltroFase('todas');
        setOrdenacao('nome_asc');
    };

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
                // --- PROP ADICIONADA AQUI ---
                onLimparFiltros={handleLimparFiltros}
            />
            <main className="container">
                {loading ? (
                    <div id="nucleosGrid">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <NucleoCardSkeleton key={index} />
                        ))}
                    </div>
                 ) : (
                    <NucleosGrid 
                        nucleos={nucleosFiltrados} 
                        onView={(nucleo) => handleOpenManageModal(nucleo, 'view')}
                        onEdit={(nucleo) => handleOpenManageModal(nucleo, 'edit')}
                        onDelete={handleOpenDeleteModal} 
                    />
                )}
            </main>
            
            <AddNucleoModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} fases={FASES} />
            {selectedNucleo && (
              <>
                <ManageNucleoModal isOpen={isManageModalOpen} onClose={() => setManageModalOpen(false)} nucleo={selectedNucleo} fases={FASES} initialMode={initialModalMode} />
                <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} nucleo={selectedNucleo} />
              </>
            )}
            
            {/* O ToastContainer global pode vir do seu main.jsx, se preferir */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme={theme} />
        </>
    );
}

export default App;