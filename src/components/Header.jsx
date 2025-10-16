// src/components/Header.jsx

import React, { useState, useEffect, useRef } from 'react';
// Importando os ícones corretos das bibliotecas certas
import { FiFilter, FiPlus } from 'react-icons/fi'; 
import { TbClearAll } from 'react-icons/tb'; // <-- CORREÇÃO: O nome correto do ícone
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import logoPrefeitura from '../assets/logo-prefeitura.png';

function Header({ 
    busca, 
    onBuscaChange, 
    filtroFase, 
    onFiltroFaseChange, 
    onAbrirModal, 
    fases = [], 
    ordenacao, 
    onOrdenacaoChange, 
    theme, 
    setTheme,
    onLimparFiltros 
}) {
    const [filtrosAbertos, setFiltrosAbertos] = useState(false);
    const filtroRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (filtroRef.current && !filtroRef.current.contains(event.target)) {
                setFiltrosAbertos(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [filtroRef]);

    return (
        <header className="main-header">
            <div className="container">
                <div className="header-top-row">
                    <div className="logo-container">
                        <img src={logoPrefeitura} alt="Logo da Prefeitura" />
                        <h1>Dashboard de REURB</h1>
                    </div>
                    <UserDropdown />
                </div>
                <div className="toolbar">
                    <input 
                        type="search" 
                        id="buscaInput" 
                        placeholder="Buscar por nome ou decreto..." 
                        value={busca} 
                        onChange={(e) => onBuscaChange(e.target.value)} 
                    />
                    
                    <div className="toolbar-actions">
                        <div className="filtro-container" ref={filtroRef}>
                            <button className="secondary-btn" onClick={() => setFiltrosAbertos(!filtrosAbertos)}>
                                <FiFilter size={18} />
                                <span>Filtros & Ordenação</span>
                            </button>

                            <div className={`filtro-dropdown ${filtrosAbertos ? 'show' : ''}`}>
                                <div className="filtro-dropdown-header">
                                    <h4>Filtros</h4>
                                    <button 
                                        className="icon-btn-tooltip" 
                                        onClick={() => onLimparFiltros && onLimparFiltros()}
                                        data-tooltip="Limpar filtros"
                                    >
                                        {/* <-- CORREÇÃO: Usando o nome correto do ícone */}
                                        <TbClearAll size={18} />
                                    </button>
                                </div>
                                
                                <label htmlFor="filtroFaseDropdown">Fase do Processo</label>
                                <select 
                                    id="filtroFaseDropdown" 
                                    value={filtroFase} 
                                    onChange={(e) => onFiltroFaseChange(e.target.value)}
                                >
                                    <option value="todas">Todas as Fases</option>
                                    {fases.map(fase => (
                                        <option key={fase} value={fase}>{fase}</option>
                                    ))}
                                </select>
                                
                                <label htmlFor="filtroOrdenacaoDropdown">Ordenar Por</label>
                                <select 
                                    id="filtroOrdenacaoDropdown" 
                                    value={ordenacao} 
                                    onChange={(e) => onOrdenacaoChange(e.target.value)}
                                >
                                    <option value="nome_asc">Nome (A-Z)</option>
                                    <option value="nome_desc">Nome (Z-A)</option>
                                    <option value="data_recente">Mais Recentes</option>
                                </select>
                            </div>
                        </div>
                        
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                        
                        <button className="primary-btn" onClick={onAbrirModal}>
                           <FiPlus size={20} />
                            <span>Novo Núcleo</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;