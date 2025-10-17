// src/components/ManageNucleoModal.jsx

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { nucleosCollection, firebase } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import HistoricoList from './HistoricoList';

const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, '-');
};

function ManageNucleoModal({ isOpen, onClose, nucleo, fases, initialMode = 'view' }) {
    const [isEditing, setIsEditing] = useState(false);
    const [fase, setFase] = useState('');
    const [atribuidoA, setAtribuidoA] = useState('');
    const [pendenciaInput, setPendenciaInput] = useState('');
    const [activeTab, setActiveTab] = useState('detalhes');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const dialogRef = useRef(null);
    const { userProfile } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setIsEditing(initialMode === 'edit');
            setActiveTab('detalhes');
            if (nucleo) {
                setFase(nucleo.fase?.nome || fases[0]);
                setAtribuidoA(nucleo.fase?.atribuidoA || '');
                setPendenciaInput(nucleo.pendencia?.descricao || '');
            }
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, initialMode, nucleo, fases]);

    const salvarHistorico = async (acoes) => {
        if (!userProfile || acoes.length === 0) return;
        const historicoRef = nucleosCollection.doc(nucleo.id).collection('historico');
        const promessas = acoes.map(acao => 
            historicoRef.add({
                acao: acao,
                alteradoPor: userProfile.fullName,
                data: firebase.firestore.FieldValue.serverTimestamp()
            })
        );
        await Promise.all(promessas);
    };

    const handleSalvarGeral = async () => {
        setIsSubmitting(true);
        const acoes = [];
        if (nucleo.fase?.nome !== fase) acoes.push(`Fase alterada de '${nucleo.fase?.nome || "N/A"}' para '${fase}'.`);
        if (nucleo.fase?.atribuidoA !== atribuidoA) acoes.push(`Responsável pela fase alterado para '${atribuidoA}'.`);
        
        try {
            await nucleosCollection.doc(nucleo.id).update({ 
                'fase.nome': fase, 
                'fase.atribuidoA': atribuidoA, 
                'fase.data': new Date().toISOString() 
            });
            await salvarHistorico(acoes);
            toast.success("Alterações salvas com sucesso!");
            setIsEditing(false);
        } catch (error) {
            toast.error("Erro ao salvar alterações.");
            console.error("Erro:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLancarPendencia = async () => {
        if (!pendenciaInput) {
            toast.warn('Por favor, descreva a pendência.');
            return;
        }
        try {
            await nucleosCollection.doc(nucleo.id).update({ 'pendencia.ativa': true, 'pendencia.descricao': pendenciaInput, 'pendencia.data': new Date().toISOString(), 'pendencia.resolvida': false });
            await salvarHistorico([`Pendência registrada: "${pendenciaInput}".`]);
            toast.success("Pendência lançada com sucesso!");
            onClose(); // Fecha o modal após a ação
        } catch (error) {
            toast.error("Erro ao lançar pendência.");
        }
    };

    const handleResolverPendencia = async () => {
        try {
            await nucleosCollection.doc(nucleo.id).update({ 'pendencia.ativa': false, 'pendencia.resolvida': true });
            await salvarHistorico([`Pendência resolvida: "${nucleo.pendencia?.descricao}".`]);
            toast.success("Pendência resolvida com sucesso!");
            onClose(); // Fecha o modal após a ação
        } catch (error) {
            toast.error("Erro ao resolver pendência.");
        }
    };
    
    const FASES_ARRAY = ["Instauração", "Notificação e Buscas", "Urbanismo", "Ambiental", "Jurídico", "Cartório", "Titulação", "Finalizado"];
    const faseAtualIndex = FASES_ARRAY.findIndex(f => f === nucleo?.fase?.nome);
    const progresso = faseAtualIndex >= 0 ? ((faseAtualIndex + 1) / FASES_ARRAY.length) * 100 : 0;
    const dataInstauracao = nucleo ? new Date(nucleo.dataInstauracao + 'T03:00:00Z').toLocaleDateString('pt-BR') : 'N/A';
    const dataFase = nucleo?.fase?.data ? new Date(nucleo.fase.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A';
    const faseClassName = nucleo?.fase?.nome ? 'fase-' + normalizarTexto(nucleo.fase.nome) : '';

    return (
        <dialog ref={dialogRef} className={`view-modal ${faseClassName}`} onClose={onClose}>
            <div className="view-modal-header"><h2>{nucleo?.nome}</h2><p>Decreto {nucleo?.decreto}</p></div>
            
            <div className="modal-tabs">
                <button className={`tab-btn ${activeTab === 'detalhes' ? 'active' : ''}`} onClick={() => setActiveTab('detalhes')}>Detalhes</button>
                <button className={`tab-btn ${activeTab === 'historico' ? 'active' : ''}`} onClick={() => setActiveTab('historico')}>Histórico</button>
            </div>

            <div className="view-modal-body">
                {activeTab === 'detalhes' && (
                    isEditing ? (
                        <>
                            <fieldset className="view-modal-section"><legend>Mudar Status do Processo</legend><div className="form-group"><label>Nova Fase:</label><select value={fase} onChange={e => setFase(e.target.value)}>{fases.map(f => <option key={f} value={f}>{f}</option>)}</select></div><div className="form-group"><label>Atribuir a:</label><input type="text" placeholder="Nome do responsável" value={atribuidoA} onChange={e => setAtribuidoA(e.target.value)} /></div></fieldset>
                            <fieldset className="view-modal-section"><legend>Gerenciar Pendência</legend>{nucleo?.pendencia?.ativa ? (<div className="pendencia-detalhe ativa"><p>"{nucleo.pendencia.descricao}"</p><button type="button" className="success-btn" style={{marginLeft: 'auto'}} onClick={handleResolverPendencia}>Resolver</button></div>) : (<div className="form-group"><label>Nova Pendência:</label><input type="text" placeholder="Ex: Falta documento X" value={pendenciaInput} onChange={e => setPendenciaInput(e.target.value)} /><button type="button" className="danger-btn" style={{marginTop: '10px'}} onClick={handleLancarPendencia}>Lançar Pendência</button></div>)}</fieldset>
                        </>
                    ) : (
                        <>
                            <fieldset className="view-modal-section"><legend>Status Atual</legend><div className="view-modal-info"><span className="label">Fase:</span><span className={`value status-tag ${faseClassName}`}>{nucleo?.fase?.nome || 'Indefinida'}</span></div><div className="view-modal-info progress-info"><span className="label">Progresso:</span><div className="progress-bar-container"><div className="progress-bar" style={{ width: `${progresso}%` }}></div></div></div></fieldset>
                            <fieldset className="view-modal-section"><legend>Detalhes do Processo</legend><div className="view-modal-info"><span className="label">Data de Instauração:</span><span className="value">{dataInstauracao}</span></div><div className="view-modal-info"><span className="label">Responsável pela Fase:</span><span className="value">{nucleo?.fase?.atribuidoA || 'N/A'}</span></div><div className="view-modal-info"><span className="label">Última Atualização:</span><span className="value">{dataFase}</span></div></fieldset>
                            <fieldset className="view-modal-section"><legend>Pendências</legend><div className={`pendencia-detalhe ${nucleo?.pendencia?.ativa ? 'ativa' : ''}`}><p>{nucleo?.pendencia?.ativa ? nucleo.pendencia.descricao : 'Nenhuma pendência ativa.'}</p></div></fieldset>
                        </>
                    )
                )}
                {activeTab === 'historico' && nucleo && (
                    <HistoricoList nucleoId={nucleo.id} />
                )}
            </div>

            <div className="form-actions">
                {activeTab === 'historico' ? (
                    // Se a aba de histórico estiver ativa, mostre APENAS o botão de fechar
                    <button type="button" className="secondary-btn" onClick={onClose}>Fechar</button>
                ) : (
                    // Caso contrário (estamos na aba de detalhes), use a lógica de edição
                    isEditing ? (
                        <>
                            <button type="button" className="secondary-btn" onClick={() => setIsEditing(false)}>Cancelar</button>
                            <button type="button" className="primary-btn" onClick={handleSalvarGeral} disabled={isSubmitting}>
                                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" className="secondary-btn" onClick={onClose}>Fechar</button>
                            <button type="button" className="primary-btn" onClick={() => setIsEditing(true)}>Editar</button>
                        </>
                    )
                )}
            </div>
        </dialog>
    );
}

export default ManageNucleoModal;