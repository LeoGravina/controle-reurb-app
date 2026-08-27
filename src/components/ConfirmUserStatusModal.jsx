// src/components/ConfirmUserStatusModal.jsx

import { useRef, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { usersCollection } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

function ConfirmUserStatusModal({ isOpen, onClose, usuario, acao }) {
    const dialogRef = useRef(null);
    const [salvando, setSalvando] = useState(false);
    const { userProfile } = useAuth();

    useEffect(() => {
        if (isOpen) { dialogRef.current?.showModal(); } else { dialogRef.current?.close(); }
    }, [isOpen]);

    const desativando = acao === 'desativar';

    const handleConfirm = async () => {
        if (!usuario) return;
        setSalvando(true);
        try {
            await usersCollection.doc(usuario.id).update({
                status: desativando ? 'inativo' : 'ativo',
                statusAlteradoEm: new Date().toISOString(),
                statusAlteradoPor: userProfile?.fullName || ''
            });
            toast.success(
                desativando
                    ? `Acesso de "${usuario.fullName}" foi removido.`
                    : `Acesso de "${usuario.fullName}" foi reativado.`
            );
            onClose();
        } catch (error) {
            console.error('Erro ao alterar status do usuário:', error);
            toast.error('Erro ao alterar o acesso do usuário.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <dialog ref={dialogRef} onClose={onClose}>
            <div style={{ textAlign: 'center', padding: '25px' }}>
                <h2>{desativando ? 'Remover Acesso' : 'Reativar Acesso'}</h2>
                <p>
                    {desativando
                        ? 'Você tem certeza que deseja remover o acesso de:'
                        : 'Você tem certeza que deseja devolver o acesso para:'}
                    <br />
                    <strong style={{ display: 'block', margin: '10px 0', fontSize: '1.1rem' }}>
                        {usuario?.fullName} ({usuario?.username})
                    </strong>
                    {desativando
                        ? 'Ele será desconectado imediatamente e não conseguirá mais entrar no sistema.'
                        : 'Ele voltará a conseguir entrar no sistema com a mesma senha.'}
                </p>
                <div className="form-actions" style={{ justifyContent: 'center', borderTop: 'none', padding: '10px 0 0' }}>
                    <button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button>
                    <button
                        type="button"
                        className={desativando ? 'danger-btn' : 'success-btn'}
                        onClick={handleConfirm}
                        disabled={salvando}
                    >
                        {salvando ? 'Salvando...' : (desativando ? 'Sim, Remover' : 'Sim, Reativar')}
                    </button>
                </div>
            </div>
        </dialog>
    );
}

export default ConfirmUserStatusModal;
