// src/pages/ProfilePage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { toast } from 'react-toastify';

function ProfilePage() {
    // Obtém os dados do usuário do nosso contexto de autenticação
    const { currentUser, userProfile } = useAuth();
    
    // Estado para o formulário de informações do perfil
    const [fullName, setFullName] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Estado para o formulário de alteração de senha
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);

    // Efeito que preenche o formulário com os dados do usuário quando a página carrega
    useEffect(() => {
        if (userProfile) {
            setFullName(userProfile.fullName);
        }
    }, [userProfile]);

    // Função para atualizar o nome do usuário no Firestore
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        const userDocRef = db.collection('users').doc(currentUser.uid);
        try {
            await userDocRef.update({ fullName });
            toast.success("Nome atualizado com sucesso!");
        } catch (error) {
            toast.error("Erro ao atualizar o nome.");
            console.error("Erro ao atualizar perfil:", error);
        }
        setLoadingProfile(false);
    };

    // Função para atualizar a senha do usuário no Firebase Authentication
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.warn("A nova senha deve ter no mínimo 6 caracteres.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }
        setLoadingPassword(true);
        try {
            await currentUser.updatePassword(newPassword);
            toast.success("Senha alterada com sucesso!");
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error("Erro ao alterar senha:", error);
            toast.error("Erro ao alterar a senha. Para sua segurança, pode ser necessário fazer login novamente.");
        }
        setLoadingPassword(false);
    };

    // Mostra uma mensagem de carregamento enquanto os dados do usuário não chegam
    if (!userProfile || !currentUser) {
        return (
            <div className="container">
                <h1>Carregando perfil...</h1>
            </div>
        );
    }

    return (
        // Usamos um Fragment <> para agrupar o header e o main
        <>
            <header className="main-header profile-page-header">
                <div className="container">
                    <div className="profile-header-content">
                        <h1>Meu Perfil</h1>
                        <Link to="/" className="secondary-btn">Voltar ao Dashboard</Link>
                    </div>
                </div>
            </header>
            
            <main className="container profile-page-content">
                <section className="profile-section">
                    <h2>Informações da Conta</h2>
                    <form onSubmit={handleProfileUpdate}>
                        <div className="form-group">
                            <label>Nome Completo</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>E-mail (associado à conta)</label>
                            <input type="email" value={currentUser.email} disabled />
                        </div>
                         <div className="form-group">
                            <label>Username (para login)</label>
                            <input type="text" value={userProfile.username} disabled />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="primary-btn" disabled={loadingProfile}>
                                {loadingProfile ? 'Salvando...' : 'Salvar Nome'}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="profile-section">
                    <h2>Alterar Senha</h2>
                    <p>Sua nova senha deve ter no mínimo 6 caracteres.</p>
                    <form onSubmit={handlePasswordUpdate}>
                         <div className="form-group">
                            <label>Nova Senha</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Digite a nova senha" />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Nova Senha</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="primary-btn" disabled={loadingPassword}>
                                {loadingPassword ? 'Alterando...' : 'Alterar Senha'}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </>
    );
}

export default ProfilePage;