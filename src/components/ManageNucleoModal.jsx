// src/components/ManageNucleoModal.jsx

import { useState, useRef, useEffect } from 'react';
import { nucleosCollection } from '../firebase/config';

const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, '-');
};

function ManageNucleoModal({ isOpen, onClose, nucleo, fases, initialMode = 'view' }) {
    const [isEditing, setIsEditing] = useState(false);
    const [fase, setFase] = useState('');
    const [atribuidoA, setAtribuidoA] = useState('');
    const [pendenciaInput, setPendenciaInput] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const dialogRef = useRef(null);
    
    useEffect(() => {
        if (isOpen) {
            setNotification({ message: '', type: '' });
            setIsEditing(initialMode === 'edit');
            if (nucleo) {
                setFase(nucleo.fase?.nome || fases[0]);
                setAtribuidoA(nucleo.fase?.atribuidoA || '');
                setPendenciaInput('');
            }
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, initialMode, nucleo, fases]);

    const showNotificationAndClose = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => { onClose(); }, 1500);
    };

    const handleUpdateFase = async () => {
        try {
            await nucleosCollection.doc(nucleo.id).update({ 'fase.nome': fase, 'fase.atribuidoA': atribuidoA, 'fase.data': new Date().toISOString() });
            showNotificationAndClose("Fase atualizada com sucesso!", "success");
        } catch (error) {
            showNotificationAndClose("Erro ao atualizar a fase.", "danger");
        }
    };
    
    const handleLancarPendencia = async () => {
        if (!pendenciaInput) {
            setNotification({ message: 'Por favor, descreva a pendência.', type: 'danger' });
            setTimeout(() => setNotification({ message: '', type: '' }), 2000);
            return;
        }
        try {
            await nucleosCollection.doc(nucleo.id).update({ 'pendencia.ativa': true, 'pendencia.descricao': pendenciaInput, 'pendencia.data': new Date().toISOString(), 'pendencia.resolvida': false });
            showNotificationAndClose("Pendência lançada com sucesso!", "success");
        } catch (error) {
            showNotificationAndClose("Erro ao lançar pendência.", "danger");
        }
    };

    const handleResolverPendencia = async () => {
        try {
            await nucleosCollection.doc(nucleo.id).update({ 'pendencia.ativa': false, 'pendencia.resolvida': true });
            showNotificationAndClose("Pendência resolvida com sucesso!", "success");
        } catch (error) {
            showNotificationAndClose("Erro ao resolver pendência.", "danger");
        }
    };
    
    const FASES_ARRAY = ["Instauração", "Notificação e Buscas", "Urbanismo", "Ambiental", "Jurídico", "Cartório", "Titulação", "Finalizado"];
    const faseAtualIndex = FASES_ARRAY.findIndex(f => f === nucleo?.fase?.nome);
    const progresso = faseAtualIndex >= 0 ? ((faseAtualIndex + 1) / FASES_ARRAY.length) * 100 : 0;
    const dataInstauracao = nucleo ? new Date(nucleo.dataInstauracao + 'T03:00:00Z').toLocaleDateString('pt-BR') : 'N/A';
    const dataFase = nucleo?.fase?.data ? new Date(nucleo.fase.data).toLocaleDateString('pt-BR') : 'N/A';
    const faseClassName = nucleo?.fase?.nome ? 'fase-' + normalizarTexto(nucleo.fase.nome) : '';

    return (
        <dialog ref={dialogRef} className={`view-modal ${faseClassName}`} onClose={onClose}>
            <div className="view-modal-header"><h2>{nucleo?.nome}</h2><p>Decreto {nucleo?.decreto}</p></div>
            <div className="view-modal-body">
                {isEditing ? (
                    <>
                        <fieldset className="view-modal-section"><legend>Mudar Status do Processo</legend><div className="form-group"><label>Nova Fase:</label><select value={fase} onChange={e => setFase(e.target.value)}>{fases.map(f => <option key={f} value={f}>{f}</option>)}</select></div><div className="form-group"><label>Atribuir a:</label><input type="text" placeholder="Nome do responsável" value={atribuidoA} onChange={e => setAtribuidoA(e.target.value)} /></div></fieldset>
                        <fieldset className="view-modal-section"><legend>Gerenciar Pendência</legend>{nucleo?.pendencia?.ativa ? (<div className="pendencia-detalhe ativa"><p>"{nucleo.pendencia.descricao}"</p><button type="button" className="success-btn" style={{marginLeft: 'auto'}} onClick={handleResolverPendencia}>Resolvida</button></div>) : (<div className="form-group"><label>Nova Pendência:</label><input type="text" placeholder="Ex: Falta documento X" value={pendenciaInput} onChange={e => setPendenciaInput(e.target.value)} /><button type="button" className="danger-btn" style={{marginTop: '10px'}} onClick={handleLancarPendencia}>Lançar Pendência</button></div>)}</fieldset>
                    </>
                ) : (
                    <>
                        <fieldset className="view-modal-section"><legend>Status Atual</legend><div className="view-modal-info"><span className="label">Fase:</span><span className={`value status-tag ${faseClassName}`}>{nucleo?.fase?.nome || 'Indefinida'}</span></div><div className="view-modal-info progress-info"><span className="label">Progresso:</span><div className="progress-bar-container"><div className="progress-bar" style={{ width: `${progresso}%` }}></div></div></div></fieldset>
                        <fieldset className="view-modal-section"><legend>Detalhes do Processo</legend><div className="view-modal-info"><span className="label">Data de Instauração:</span><span className="value">{dataInstauracao}</span></div><div className="view-modal-info"><span className="label">Responsável pela Fase:</span><span className="value">{nucleo?.fase?.atribuidoA || 'N/A'}</span></div><div className="view-modal-info"><span className="label">Última Atualização:</span><span className="value">{dataFase}</span></div></fieldset>
                        <fieldset className="view-modal-section"><legend>Pendências</legend><div className={`pendencia-detalhe ${nucleo?.pendencia?.ativa ? 'ativa' : ''}`}><p>{nucleo?.pendencia?.ativa ? nucleo.pendencia.descricao : 'Nenhuma pendência ativa.'}</p></div></fieldset>
                    </>
                )}
            </div>
            <div className="form-actions">
                {notification.message ? (<div className={`modal-notification ${notification.type}`}>{notification.message}</div>) : (isEditing ? (<><button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button><button type="button" className="primary-btn" onClick={handleUpdateFase}>Salvar</button></>) : (<><button type="button" className="secondary-btn" onClick={onClose}>Fechar</button><button type="button" className="primary-btn" onClick={() => setIsEditing(true)}>Editar</button></>))}
            </div>
        </dialog>
    );
}
export default ManageNucleoModal;