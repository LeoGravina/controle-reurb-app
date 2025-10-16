
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, firebase } from '../firebase/config';
import { toast } from 'react-toastify';

function ProfilePage() {
    const { currentUser, userProfile } = useAuth();
    
    // Estados para o formulário de perfil
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Estados para o formulário de senha
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);

    // Efeito para preencher o formulário com os dados do usuário
    useEffect(() => {
        if (userProfile) {
            setFullName(userProfile.fullName);
            setUsername(userProfile.username);
        }
    }, [userProfile]);

    // --- FUNÇÃO PARA ATUALIZAR NOME E USERNAME ---
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        
        if (fullName.trim() === '' || username.trim() === '') {
            toast.warn("Nome e username não podem estar vazios.");
            return;
        }
        if (fullName === userProfile.fullName && username === userProfile.username) {
            toast.info("Nenhuma alteração para salvar.");
            return;
        }

        setLoadingProfile(true);

        try {
            if (username !== userProfile.username) {
                const usersRef = db.collection('users');
                const querySnapshot = await usersRef.where('username', '==', username).get();
                if (!querySnapshot.empty) {
                    toast.error("Este nome de usuário já está em uso!");
                    setLoadingProfile(false);
                    return;
                }
            }
            const userDocRef = db.collection('users').doc(currentUser.uid);
            await userDocRef.update({ fullName, username });
            toast.success("Perfil atualizado com sucesso!");

        } catch (error) {
            toast.error("Erro ao atualizar o perfil.");
            console.error("Firebase Update Error:", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    // --- FUNÇÃO PARA ATUALIZAR A SENHA ---
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.warn("Por favor, preencha todos os campos de senha.");
            return;
        }
        if (newPassword.length < 6) {
            toast.warn("A nova senha deve ter no mínimo 6 caracteres.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("As novas senhas não coincidem.");
            return;
        }
        
        setLoadingPassword(true);
        try {
            const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPassword);
            await currentUser.reauthenticateWithCredential(credential);
            await currentUser.updatePassword(newPassword);

            toast.success("Senha alterada com sucesso!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                toast.error("A senha atual está incorreta.");
            } else {
                toast.error("Erro ao alterar a senha. Tente novamente.");
            }
            console.error("Password Update Error:", error);
        } finally {
            setLoadingPassword(false);
        }
    };

    if (!userProfile || !currentUser) {
        return <div className="container"><h1>Carregando perfil...</h1></div>;
    }

    return (
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
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Username (para login)</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>E-mail (associado à conta)</label>
                            <input type="email" value={currentUser.email} disabled />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="primary-btn" disabled={loadingProfile}>
                                {loadingProfile ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="profile-section">
                    <h2>Alterar Senha</h2>
                    <p>Para sua segurança, informe sua senha atual para definir uma nova.</p>
                    <form onSubmit={handlePasswordUpdate}>
                         <div className="form-group">
                            <label>Senha Atual</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Digite sua senha atual" required />
                        </div>
                         <div className="form-group">
                            <label>Nova Senha</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" required />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Nova Senha</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" required />
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