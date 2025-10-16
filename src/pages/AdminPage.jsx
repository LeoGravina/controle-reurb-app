// src/pages/AdminPage.jsx

import { useState, useEffect } from 'react';
import { db, functions, auth } from '../firebase/config';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('user');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = db.collection('users').orderBy('fullName').onSnapshot(snapshot => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar usuários:", error);
            toast.error("Não foi possível carregar a lista de usuários.");
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const clearForm = () => {
        setEmail(''); setPassword(''); setFullName(''); setUsername(''); setRole('user');
        setIsEditing(false); setEditingUser(null);
    };

    const handleTestAuth = async () => {
    console.log("Iniciando teste de autenticação...");
    try {
        const testAuth = functions.httpsCallable('testAuth');
        const result = await testAuth();
        console.log("Resultado do Teste de Autenticação:", result.data);
        toast.info(`Resultado do teste: ${result.data.status}`);
    } catch (error) {
        console.error("Erro ao chamar a função de teste:", error);
        toast.error(`Erro no teste: ${error.message}`);
    }
    };

    const handleEditClick = (user) => {
        setIsEditing(true);
        setEditingUser(user);
        setFullName(user.fullName);
        setUsername(user.username);
        setEmail(user.email);
        setRole(user.role);
        setPassword('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            handleUpdateUser();
        } else {
            handleCreateUser();
        }
    };

    const handleCreateUser = async () => {
        setIsSubmitting(true);
        if (password.length < 6) { toast.warn("A senha deve ter no mínimo 6 caracteres."); setIsSubmitting(false); return; }
        try {
            const createUser = functions.httpsCallable('createUser');
            const result = await createUser({ email, password, fullName, username });
            toast.success(result.data.result);
            clearForm();
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            toast.error(error.message);
        } finally { setIsSubmitting(false); }
    };
    
    const handleUpdateUser = async () => {
        setIsSubmitting(true);
        try {
            // ADICIONE A LINHA ABAIXO
            // Força a atualização do token de autenticação antes da chamada
            await auth.currentUser.getIdToken(true);

            const updateUser = functions.httpsCallable('updateUser');
            const result = await updateUser({ uid: editingUser.id, fullName, username, role });
            toast.success(result.data.result);
            clearForm();
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        try {
            const deleteUser = functions.httpsCallable('deleteUser');
            const result = await deleteUser({ uid: userToDelete.id });
            toast.success(result.data.result);
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            toast.error(error.message);
        }
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const generateDefaultPassword = () => setPassword('123456');

    return (
        <>
            <div className="admin-page">
                <header className="admin-header">
                    <div className="container">
                        <h1>Painel de Administração</h1>
                        {/* ADICIONE O BOTÃO DE TESTE AQUI */}
                        <button onClick={handleTestAuth} className="secondary-btn" style={{marginLeft: '20px'}}>Testar Autenticação</button>
                        <Link to="/" className="secondary-btn">Voltar ao Dashboard</Link>
                    </div>
                </header>
                <main className="container admin-layout">
                    <section className="admin-card create-user-form">
                        <h2>{isEditing ? `Editando: ${editingUser.fullName}` : 'Criar Novo Usuário'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label>Nome Completo</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                            <div className="form-group"><label>Username (para login)</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ex: joao.silva" required /></div>
                            <div className="form-group"><label>E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isEditing} /></div>
                            <div className="form-group"><label>Role</label><select value={role} onChange={(e) => setRole(e.target.value)}><option value="user">User</option><option value="admin">Admin</option></select></div>
                            {!isEditing && (<div className="form-group"><label>Senha Temporária</label><div className="password-wrapper"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required /><button type="button" className="secondary-btn" onClick={generateDefaultPassword}>Padrão</button></div></div>)}
                            <div className="form-actions">{isEditing && <button type="button" className="secondary-btn" onClick={clearForm}>Cancelar</button>}<button type="submit" className="primary-btn" disabled={isSubmitting}>{isSubmitting ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar Alterações' : 'Criar Usuário')}</button></div>
                        </form>
                    </section>
                    <section className="admin-card user-list">
                        <h2>Usuários Cadastrados</h2>
                        {loading ? <p>Carregando...</p> : (<div className="user-list-table"><div className="user-list-header"><span>Nome</span><span>Username</span><span>Role</span><span>Ações</span></div>{users.map(user => (<div key={user.id} className="user-list-row"><span>{user.fullName}</span><span className="text-light">{user.username}</span><span className={`role-tag role-${user.role}`}>{user.role}</span><div className="user-actions"><button className="icon-btn" title="Editar" onClick={() => handleEditClick(user)}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button><button className="icon-btn delete-btn" title="Excluir" onClick={() => handleDeleteClick(user)}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button></div></div>))}</div>)}
                    </section>
                </main>
            </div>
            {userToDelete && <ConfirmDeleteModal isOpen={isDeleteModalOpen} item={userToDelete} onConfirm={handleConfirmDelete} onClose={() => setIsDeleteModalOpen(false)} />}
        </>
    );
}

export default AdminPage;