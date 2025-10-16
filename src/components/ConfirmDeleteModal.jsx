// src/components/ConfirmDeleteModal.jsx

import { useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

// O componente agora recebe uma prop genérica 'item' e uma função 'onConfirm'
function ConfirmDeleteModal({ isOpen, onClose, item, onConfirm }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen]);

    // Lógica para exibir o nome correto (seja 'username' de um usuário ou 'nome' de um núcleo)
    const displayName = item?.username || item?.nome || 'este item';
    const subText = item?.decreto ? `(Decreto ${item.decreto})` : (item?.email ? `(${item.email})` : '');

    return (
        <dialog ref={dialogRef} onClose={onClose}>
            <div style={{textAlign: 'center'}}>
                <h2>Confirmar Exclusão</h2>
                <p>
                    Você tem certeza que deseja excluir:
                    <br />
                    <strong style={{ display: 'block', margin: '10px 0', fontSize: '1.1rem' }}>
                        {displayName} {subText}
                    </strong>
                    Esta ação não pode ser desfeita.
                </p>
                <div className="form-actions" style={{justifyContent: 'center'}}>
                    <button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button>
                    {/* O botão de confirmação agora chama a função onConfirm passada como prop */}
                    <button type="button" className="danger-btn" onClick={onConfirm}>Sim, Excluir</button>
                </div>
            </div>
        </dialog>
    );
}

export default ConfirmDeleteModal;