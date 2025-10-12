import React from 'react';
import ThemeToggle from './ThemeToggle';

function Header({ busca, onBuscaChange, filtroFase, onFiltroFaseChange, onAbrirModal, fases = [], ordenacao, onOrdenacaoChange }) {
    return (
        <header className="main-header">
            <div className="container">
                <h1>Dashboard de REURB</h1>
                <div className="toolbar">
                    <input type="search" id="buscaInput" placeholder="Buscar por nome ou decreto..." value={busca} onChange={(e) => onBuscaChange(e.target.value)} />
                    <select id="filtroFase" value={filtroFase} onChange={(e) => onFiltroFaseChange(e.target.value)}>
                        <option value="todas">Todas as Fases</option>
                        {fases.map(fase => (<option key={fase} value={fase}>{fase}</option>))}
                    </select>
                    <select id="filtroOrdenacao" value={ordenacao} onChange={(e) => onOrdenacaoChange(e.target.value)}>
                        <option value="nome_asc">Ordenar por Nome (A-Z)</option>
                        <option value="nome_desc">Ordenar por Nome (Z-A)</option>
                        <option value="data_recente">Mais Recentes</option>
                    </select>
                    <div className="header-actions">
                        <ThemeToggle />
                        <button className="primary-btn" onClick={onAbrirModal}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            <span>Novo Núcleo</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;