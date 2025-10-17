// src/pages/App.jsx

import { useState, useEffect, useMemo } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { nucleosCollection } from '../firebase/config';

// Componentes
import Header from '../components/Header';
import KpiDashboard from '../components/KpiDashboard';
import NucleosGrid from '../components/NucleosGrid';
import AddNucleoModal from '../components/AddNucleoModal';
import ManageNucleoModal from '../components/ManageNucleoModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import NucleoCardSkeleton from '../components/NucleoCardSkeleton';
import { useAuth } from '../context/AuthContext';

const FASES = [ "Pendente de Instruções", "Instauração", "Notificação e Buscas", "Análise Sócio-Econômica", "Urbanismo", "Ambiental", "Jurídico", "Cartório", "Titulação", "Finalizado", "Indeferido" ];

function App() {
    const [todosNucleos, setTodosNucleos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [filtroFase, setFiltroFase] = useState('todas');
    const [filtroPendencia, setFiltroPendencia] = useState(null);
    const [ordenacao, setOrdenacao] = useState('nome_asc');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isManageModalOpen, setManageModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedNucleo, setSelectedNucleo] = useState(null);
    const [initialModalMode, setInitialModalMode] = useState('view');
    
    const { theme, setTheme } = useAuth();

    useEffect(() => {
        const unsubscribe = nucleosCollection.orderBy("nome").onSnapshot(snapshot => {
            setTodosNucleos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const metricas = useMemo(() => {
        const total = todosNucleos.length;
        const finalizados = todosNucleos.filter(n => n.fase?.nome === 'Finalizado').length;
        const comPendencia = todosNucleos.filter(n => n.pendencia?.ativa === true).length;
        let faseComum = 'N/A';
        if (total > 0) {
            const contagemFases = todosNucleos.reduce((acc, nucleo) => {
                const faseNome = nucleo.fase?.nome || 'Indefinida';
                acc[faseNome] = (acc[faseNome] || 0) + 1;
                return acc;
            }, {});
            faseComum = Object.keys(contagemFases).reduce((a, b) => contagemFases[a] > contagemFases[b] ? a : b);
        }
        return { total, finalizados, comPendencia, faseComum };
    }, [todosNucleos]);

    const nucleosFiltrados = useMemo(() => {
        let nucleosProcessados = [...todosNucleos];
        if (busca) {
            const termoBusca = busca.toLowerCase().trim();
            nucleosProcessados = nucleosProcessados.filter(n => n.nome.toLowerCase().includes(termoBusca) || n.decreto.toLowerCase().includes(termoBusca));
        }
        if (filtroFase !== 'todas') {
            nucleosProcessados = nucleosProcessados.filter(n => n.fase?.nome === filtroFase);
        }
        if (filtroPendencia !== null) {
            nucleosProcessados = nucleosProcessados.filter(n => n.pendencia?.ativa === filtroPendencia);
        }
        nucleosProcessados.sort((a, b) => {
            switch (ordenacao) {
                case 'data_recente': 
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
    }, [todosNucleos, busca, filtroFase, ordenacao, filtroPendencia]);
    
    const handleOpenManageModal = (nucleo, mode = 'view') => {
        setSelectedNucleo(nucleo);
        setInitialModalMode(mode);
        setManageModalOpen(true);
    };

    const handleOpenDeleteModal = (nucleo) => {
        setSelectedNucleo(nucleo);
        setDeleteModalOpen(true);
    };

    const handleLimparFiltros = () => {
        setBusca('');
        setFiltroFase('todas');
        setOrdenacao('nome_asc');
        setFiltroPendencia(null);
    };

    const handleKpiClick = (tipo) => {
        setBusca('');
        setFiltroFase('todas');
        setFiltroPendencia(null);
        switch (tipo) {
            case 'finalizados': setFiltroFase('Finalizado'); break;
            case 'pendencia': setFiltroPendencia(true); break;
            case 'faseComum': setFiltroFase(metricas.faseComum); break;
            default: handleLimparFiltros(); break;
        }
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
                onLimparFiltros={handleLimparFiltros}
            />
            
            <main className="container">
                <KpiDashboard 
                    total={metricas.total}
                    finalizados={metricas.finalizados}
                    comPendencia={metricas.comPendencia}
                    faseComum={metricas.faseComum}
                    onKpiClick={handleKpiClick}
                    filtroFaseAtivo={filtroFase}
                    filtroPendenciaAtivo={filtroPendencia}
                />
                
                {loading ? (
                    <div id="nucleosGrid">
                        {Array.from({ length: 6 }).map((_, index) => <NucleoCardSkeleton key={index} />)}
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
        </>
    );
}

export default App;