// src/components/AddNucleoModal.jsx

import { useState, useRef, useEffect } from 'react';
import { nucleosCollection } from '../firebase/config';

function AddNucleoModal({ isOpen, onClose, fases }) {
    const [nome, setNome] = useState('');
    const [data, setData] = useState('');
    const [decreto, setDecreto] = useState('');
    const [responsavel, setResponsavel] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const dialogRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setNotification({ message: '', type: '' });
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen]);

    const showNotificationAndClose = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => { handleClose(); }, 1500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!responsavel) {
            setNotification({ message: 'Preencha o nome do responsável.', type: 'danger' });
            setTimeout(() => setNotification({ message: '', type: '' }), 2000);
            return;
        }
        const novoNucleo = { nome, dataInstauracao: data, decreto, fase: { nome: fases[0], atribuidoA: responsavel, data: new Date().toISOString() }, pendencia: { ativa: false, descricao: "", data: "", resolvida: true } };
        try {
            await nucleosCollection.add(novoNucleo);
            showNotificationAndClose("Núcleo criado com sucesso!", "success");
        } catch (error) {
            showNotificationAndClose("Erro ao criar núcleo.", "danger");
        }
    };

    const handleClose = () => { setNome(''); setData(''); setDecreto(''); setResponsavel(''); onClose(); };
    
    return (
        <dialog ref={dialogRef} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <h2>Adicionar Novo Núcleo</h2>
                <p>Preencha as informações básicas do núcleo.</p>
                {notification.message && (<div className={`modal-notification ${notification.type}`}>{notification.message}</div>)}
                <div className="form-group"><label>Nome do Núcleo:</label><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
                <div className="form-group"><label>Data de Instauração:</label><input type="date" value={data} onChange={(e) => setData(e.target.value)} required /></div>
                <div className="form-group"><label>Nº do Decreto:</label><input type="text" value={decreto} onChange={(e) => setDecreto(e.target.value)} required /></div>
                <div className="form-group"><label>Responsável:</label><input type="text" placeholder="Nome do responsável inicial" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} required /></div>
                <div className="form-actions"><button type="button" className="secondary-btn" onClick={handleClose}>Cancelar</button><button type="submit" className="primary-btn">Salvar</button></div>
            </form>
        </dialog>
    );
}
export default AddNucleoModal;