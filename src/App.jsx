// src/App.jsx

import { useState, useEffect, useMemo } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { nucleosCollection } from './firebase/config';
import Header from './components/Header';
import NucleosGrid from './components/NucleosGrid';
import AddNucleoModal from './components/AddNucleoModal';
import ManageNucleoModal from './components/ManageNucleoModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import ThemeToggle from './components/ThemeToggle';

const FASES = ["Instauração", "Notificação e Buscas", "Urbanismo", "Ambiental", "Jurídico", "Cartório", "Titulação", "Finalizado"];

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

    useEffect(() => {
        const unsubscribe = nucleosCollection.orderBy("nome").onSnapshot(snapshot => {
            const nucleosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTodosNucleos(nucleosData);
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
                case 'data_recente': return new Date(b.fase?.data || b.dataInstauracao) - new Date(a.fase?.data || a.dataInstauracao);
                case 'nome_desc': return b.nome.localeCompare(a.nome);
                default: return a.nome.localeCompare(b.nome);
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

    return (
        <>
            <Header {...{ busca, onBuscaChange: setBusca, filtroFase, onFiltroFaseChange: setFiltroFase, onAbrirModal: () => setAddModalOpen(true), fases: FASES, ordenacao, onOrdenacaoChange: setOrdenacao }} />
            <main className="container">
                {loading ? <p>Carregando núcleos...</p> : 
                    <NucleosGrid 
                        nucleos={nucleosFiltrados} 
                        onView={(nucleo) => handleOpenManageModal(nucleo, 'view')}
                        onEdit={(nucleo) => handleOpenManageModal(nucleo, 'edit')}
                        onDelete={handleOpenDeleteModal} 
                    />
                }
            </main>
            
            <AddNucleoModal {...{ isOpen: isAddModalOpen, onClose: () => setAddModalOpen(false), fases: FASES }} />

            {selectedNucleo && (
              <>
                <ManageNucleoModal {...{ isOpen: isManageModalOpen, onClose: () => setManageModalOpen(false), nucleo: selectedNucleo, fases: FASES, initialMode: initialModalMode }} />
                <ConfirmDeleteModal {...{ isOpen: isDeleteModalOpen, onClose: () => setDeleteModalOpen(false), nucleo: selectedNucleo }} />
              </>
            )}
            
            {/* O ToastContainer fica aqui para notificações GERAIS, caso precise no futuro */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                theme="light"
            />
        </>
    );
}

export default App;