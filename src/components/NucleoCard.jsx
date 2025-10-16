// src/components/NucleoCard.jsx

import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi'; // Usando ícones para consistência

const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, '-');
};

function NucleoCard({ nucleo, onView, onEdit, onDelete }) {
    const FASES = [ "Pendente de Instruções", "Instauração", "Notificação e Buscas", "Análise Sócio-Econômica", "Urbanismo", "Ambiental", "Jurídico", "Cartório", "Titulação", "Finalizado", "Indeferido" ];
    const { nome, decreto, dataInstauracao, fase, pendencia } = nucleo;
    const faseAtualIndex = FASES.findIndex(f => f === fase?.nome);
    const progresso = (fase?.nome === 'Indeferido') ? 100 : (faseAtualIndex >= 0 ? ((faseAtualIndex + 1) / (FASES.length - 1)) * 100 : 0);
    const faseClassName = fase?.nome ? 'fase-' + normalizarTexto(fase.nome) : '';
    const pendenciaInfo = pendencia?.ativa ? <span className="pendencia-tag sim">Sim</span> : <span className="pendencia-tag nao">Não</span>;
    
    // Tratamento de datas para evitar erros
    const dataInstauracaoFormatada = dataInstauracao ? new Date(dataInstauracao + 'T03:00:00Z').toLocaleDateString('pt-BR') : 'N/A';
    const dataFaseFormatada = fase?.data ? new Date(fase.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';

    return (
        <div className="nucleo-card" onClick={onView}>
            <div className="card-header">
                <h2>{nome}</h2>
                <p>Decreto {decreto} • Início em {dataInstauracaoFormatada}</p>
            </div>
            <div className="progress-bar-container">
                <div className={`progress-bar ${faseClassName}`} style={{ width: `${progresso}%` }}></div>
            </div>
            <div className="card-body">
                <div className="info-item">
                    <span className="label">Fase Atual:</span>
                    <span className={`value status-tag ${faseClassName}`} title={fase?.nome || 'Fase Indefinida'}>
                        {fase?.nome || 'Indefinida'}
                    </span>
                </div>
                <div className="info-item"><span className="label">Responsável:</span><span className="value">{fase?.atribuidoA || 'N/A'}</span></div>
                <div className="info-item"><span className="label">Data da Fase:</span><span className="value">{dataFaseFormatada}</span></div>
                <div className="info-item"><span className="label">Pendência:</span><span className="value">{pendenciaInfo}</span></div>
            </div>
            <div className="card-footer">
                <button className="icon-btn edit-btn" title="Gerenciar Fases e Pendências" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                    <FiEdit size={16} />
                </button>
                <button className="icon-btn delete-btn" title="Excluir Núcleo" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                     <FiTrash2 size={16} />
                </button>
            </div>
        </div>
    );
}

export default NucleoCard;