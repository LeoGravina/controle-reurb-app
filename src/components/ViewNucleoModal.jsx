// src/components/ViewNucleoModal.jsx

import { useRef, useEffect } from 'react';

const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, '-');
};

function ViewNucleoModal({ isOpen, onClose, nucleo }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen]);

    if (!nucleo) return null;

    const FASES = ["Instauração", "Notificação e Buscas", "Urbanismo", "Ambiental", "Jurídico", "Cartório", "Titulação", "Finalizado"];
    const faseAtualIndex = FASES.findIndex(f => f === nucleo.fase?.nome);
    const progresso = faseAtualIndex >= 0 ? ((faseAtualIndex + 1) / FASES.length) * 100 : 0;

    const dataInstauracao = new Date(nucleo.dataInstauracao + 'T03:00:00Z').toLocaleDateString('pt-BR');
    const dataFase = nucleo.fase?.data ? new Date(nucleo.fase.data).toLocaleDateString('pt-BR') : 'N/A';
    const faseClassName = nucleo.fase?.nome ? 'fase-' + normalizarTexto(nucleo.fase.nome) : '';

    return (
        <dialog ref={dialogRef} id="viewNucleoModal" className="view-modal" onClose={onClose}>
            <div className="view-modal-header">
                <h2>{nucleo.nome}</h2>
                <p>Decreto {nucleo.decreto}</p>
            </div>

            <div className="view-modal-body">
                <fieldset className="view-modal-section">
                    <legend>Status Atual</legend>
                    <div className="view-modal-info">
                        <span className="view-modal-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></span>
                        <span className="label">Fase:</span>
                        <span className={`value status-tag ${faseClassName}`}>{nucleo.fase?.nome || 'Indefinida'}</span>
                    </div>
                    <div className="view-modal-info progress-info">
                        <span className="label">Progresso:</span>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${progresso}%` }}></div>
                        </div>
                    </div>
                </fieldset>

                <fieldset className="view-modal-section">
                    <legend>Detalhes do Processo</legend>
                    <div className="view-modal-info">
                        <span className="view-modal-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span>
                        <span className="label">Data de Instauração:</span>
                        <span className="value">{dataInstauracao}</span>
                    </div>
                    <div className="view-modal-info">
                        <span className="view-modal-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span>
                        <span className="label">Responsável pela Fase:</span>
                        <span className="value">{nucleo.fase?.atribuidoA || 'N/A'}</span>
                    </div>
                     <div className="view-modal-info">
                        <span className="view-modal-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></span>
                        <span className="label">Última Atualização:</span>
                        <span className="value">{dataFase}</span>
                    </div>
                </fieldset>

                 <fieldset className="view-modal-section">
                    <legend>Pendências</legend>
                    <div className={`pendencia-detalhe ${nucleo.pendencia?.ativa ? 'ativa' : ''}`}>
                        <span className="view-modal-icon">
                            {nucleo.pendencia?.ativa 
                                ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            }
                        </span>
                        <p>{nucleo.pendencia?.ativa ? nucleo.pendencia.descricao : 'Nenhuma pendência ativa.'}</p>
                    </div>
                </fieldset>
            </div>

            <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={onClose}>Fechar</button>
            </div>
        </dialog>
    );
}

export default ViewNucleoModal;