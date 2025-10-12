// src/components/ConfirmDeleteModal.jsx

import { useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { nucleosCollection } from '../firebase/config';

function ConfirmDeleteModal({ isOpen, onClose, nucleo }) {
    const dialogRef = useRef(null);

    useEffect(() => { if (isOpen) { dialogRef.current?.showModal(); } else { dialogRef.current?.close(); } }, [isOpen]);

    const handleDelete = async () => {
        if (!nucleo) return;
        try {
            await nucleosCollection.doc(nucleo.id).delete();
            toast.success(`Núcleo "${nucleo.nome}" foi excluído.`);
            onClose();
        } catch (error) {
            toast.error("Erro ao excluir o núcleo.");
        }
    };

    return (
        <dialog ref={dialogRef} onClose={onClose}>
            <div style={{textAlign: 'center'}}>
                <h2>Confirmar Exclusão</h2>
                <p>
                    Você tem certeza que deseja excluir o núcleo:
                    <br />
                    <strong style={{ display: 'block', margin: '10px 0', fontSize: '1.1rem' }}>
                        {nucleo?.nome} (Decreto {nucleo?.decreto})
                    </strong>
                    Esta ação não pode ser desfeita.
                </p>
                <div className="form-actions" style={{justifyContent: 'center'}}>
                    <button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button>
                    <button type="button" className="danger-btn" onClick={handleDelete}>Sim, Excluir</button>
                </div>
            </div>
        </dialog>
    );
}
export default ConfirmDeleteModal;