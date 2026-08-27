// src/components/AddUserModal.jsx

import { useState, useRef, useEffect } from 'react';
import { usersCollection, getSecondaryAuth } from '../firebase/config';

function AddUserModal({ isOpen, onClose }) {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [salvando, setSalvando] = useState(false);
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

    const showErro = (message) => {
        setNotification({ message, type: 'danger' });
        setSalvando(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ message: '', type: '' });

        const nomeLimpo = fullName.trim();
        const usernameLimpo = username.trim().toLowerCase();
        const emailLimpo = email.trim().toLowerCase();

        if (!nomeLimpo || !usernameLimpo || !emailLimpo) {
            showErro('Preencha todos os campos.');
            return;
        }
        if (password.length < 6) {
            showErro('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setSalvando(true);
        try {
            const jaExiste = await usersCollection.where('username', '==', usernameLimpo).get();
            if (!jaExiste.empty) {
                showErro('Este nome de usuário já está em uso.');
                return;
            }

            // Criado no app secundário para não derrubar a sessão do admin
            const secondaryAuth = getSecondaryAuth();
            const credential = await secondaryAuth.createUserWithEmailAndPassword(emailLimpo, password);

            await usersCollection.doc(credential.user.uid).set({
                fullName: nomeLimpo,
                username: usernameLimpo,
                email: emailLimpo,
                role,
                status: 'ativo',
                createdAt: new Date().toISOString()
            });

            await secondaryAuth.signOut();

            setNotification({ message: 'Usuário criado com sucesso!', type: 'success' });
            setTimeout(() => handleClose(), 1200);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            if (error.code === 'auth/email-already-in-use') {
                showErro('Este e-mail já está cadastrado.');
            } else if (error.code === 'auth/invalid-email') {
                showErro('E-mail inválido.');
            } else if (error.code === 'auth/weak-password') {
                showErro('A senha é muito fraca.');
            } else {
                showErro('Erro ao criar o usuário. Tente novamente.');
            }
        } finally {
            setSalvando(false);
        }
    };

    const handleClose = () => {
        setFullName(''); setUsername(''); setEmail('');
        setPassword(''); setRole('user'); setSalvando(false);
        onClose();
    };

    return (
        <dialog ref={dialogRef} onClose={handleClose}>
            <div className="modal-header">
                <h2>Novo Usuário</h2>
            </div>

            {notification.message && (
                <div className="modal-notification-container">
                    <p className={`modal-notification ${notification.type}`}>{notification.message}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    <p style={{ marginTop: 0, marginBottom: '20px' }}>
                        O usuário entrará no sistema com o username e a senha definidos aqui.
                    </p>
                    <div className="form-group">
                        <label>Nome Completo</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Maria Silva" required />
                    </div>
                    <div className="form-group">
                        <label>Username (para login)</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="maria.silva" required />
                    </div>
                    <div className="form-group">
                        <label>E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria.silva@prefeitura.gov.br" required />
                    </div>
                    <div className="form-group">
                        <label>Senha provisória</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" required />
                    </div>
                    <div className="form-group">
                        <label>Nível de acesso</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="user">Usuário</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="secondary-btn" onClick={handleClose}>Cancelar</button>
                    <button type="submit" className="primary-btn" disabled={salvando}>
                        {salvando ? 'Criando...' : 'Criar Usuário'}
                    </button>
                </div>
            </form>
        </dialog>
    );
}

export default AddUserModal;
