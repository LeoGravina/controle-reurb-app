// src/components/KpiDashboard.jsx

import React from 'react';
import { FiGrid, FiCheckCircle, FiAlertTriangle, FiTag } from 'react-icons/fi';

function KpiCard({ icone, valor, titulo, cor, onClick, ativo }) {
    // Adiciona a classe 'ativo' se o filtro correspondente estiver ligado
    const cardClassName = `kpi-card ${ativo ? 'ativo' : ''}`;
    return (
        <div className={cardClassName} onClick={onClick}>
            <div className="kpi-icon" style={{ backgroundColor: cor }}>
                {icone}
            </div>
            <div className="kpi-info">
                <span className="kpi-valor">{valor}</span>
                <span className="kpi-titulo">{titulo}</span>
            </div>
        </div>
    );
}

function KpiDashboard({ total, finalizados, comPendencia, faseComum, onKpiClick, filtroFaseAtivo, filtroPendenciaAtivo }) {
    return (
        <section className="kpi-dashboard">
            <KpiCard 
                icone={<FiGrid size={24} />} 
                valor={total} 
                titulo="Total de Processos"
                cor="rgba(0, 123, 255, 0.1)"
                onClick={() => onKpiClick('total')}
                // O card 'Total' fica ativo se nenhum outro filtro estiver
                ativo={filtroFaseAtivo === 'todas' && filtroPendenciaAtivo === null}
            />
            <KpiCard 
                icone={<FiCheckCircle size={24} />} 
                valor={finalizados} 
                titulo="Processos Finalizados"
                cor="rgba(25, 135, 84, 0.1)"
                onClick={() => onKpiClick('finalizados')}
                ativo={filtroFaseAtivo === 'Finalizado'}
            />
            <KpiCard 
                icone={<FiAlertTriangle size={24} />} 
                valor={comPendencia} 
                titulo="Com Pendência Ativa"
                cor="rgba(220, 53, 69, 0.1)"
                onClick={() => onKpiClick('pendencia')}
                ativo={filtroPendenciaAtivo === true}
            />
            <KpiCard 
                icone={<FiTag size={24} />} 
                valor={faseComum} 
                titulo="Fase Mais Comum"
                cor="rgba(111, 66, 193, 0.1)"
                onClick={() => onKpiClick('faseComum')}
                ativo={filtroFaseAtivo === faseComum}
            />
        </section>
    );
}

export default KpiDashboard;