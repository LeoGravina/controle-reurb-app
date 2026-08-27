// src/pages/AdminPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiUserX, FiUserCheck, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { usersCollection } from '../firebase/config';
import AddUserModal from '../components/AddUserModal';
import ConfirmUserStatusModal from '../components/ConfirmUserStatusModal';

function AdminPage() {
    const { currentUser } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState('');
    const [modalAddAberto, setModalAddAberto] = useState(false);
    const [confirmacao, setConfirmacao] = useState({ usuario: null, acao: null });

    useEffect(() => {
        const unsubscribe = usersCollection.orderBy('fullName').onSnapshot(
            snapshot => {
                setUsuarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setCarregando(false);
            },
            error => {
                console.error('Erro ao carregar usuários:', error);
                setCarregando(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const usuariosFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return usuarios;
        return usuarios.filter(u =>
            (u.fullName || '').toLowerCase().includes(termo) ||
            (u.username || '').toLowerCase().includes(termo) ||
            (u.email || '').toLowerCase().includes(termo)
        );
    }, [usuarios, busca]);

    const totalAtivos = usuarios.filter(u => u.status !== 'inativo').length;

    return (
        <>
            <header className="main-header profile-page-header">
                <div className="container">
                    <div className="profile-header-content">
                        <div>
                            <h1>Gestão de Usuários</h1>
                            <p className="admin-header-subtitle">
                                {totalAtivos} com acesso ativo de {usuarios.length} cadastrados
                            </p>
                        </div>
                        <div className="admin-header-actions">
                            <Link to="/" className="secondary-btn">Voltar ao Dashboard</Link>
                            <button className="primary-btn" onClick={() => setModalAddAberto(true)}>
                                <FiPlus size={20} /><span>Novo Usuário</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container admin-page-content">
                <div className="admin-search">
                    <FiSearch size={18} />
                    <input
                        type="search"
                        placeholder="Buscar por nome, username ou e-mail..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="admin-table-wrapper">
                    {carregando ? (
                        <p className="admin-empty">Carregando usuários...</p>
                    ) : usuariosFiltrados.length === 0 ? (
                        <p className="admin-empty">Nenhum usuário encontrado.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Usuário</th>
                                    <th>E-mail</th>
                                    <th>Nível</th>
                                    <th>Status</th>
                                    <th className="col-acoes">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosFiltrados.map(usuario => {
                                    const inativo = usuario.status === 'inativo';
                                    const souEu = usuario.id === currentUser?.uid;
                                    return (
                                        <tr key={usuario.id} className={inativo ? 'linha-inativa' : ''}>
                                            <td>
                                                <div className="admin-user-cell">
                                                    <span className="user-avatar">{(usuario.fullName || '?').charAt(0)}</span>
                                                    <div className="admin-user-info">
                                                        <strong title={usuario.fullName}>{usuario.fullName}</strong>
                                                        <span className="admin-username">@{usuario.username}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="admin-email" title={usuario.email}>{usuario.email}</td>
                                            <td>
                                                <span className={`role-tag ${usuario.role === 'admin' ? 'admin' : 'user'}`}>
                                                    {usuario.role === 'admin' ? 'Administrador' : 'Usuário'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-acesso ${inativo ? 'inativo' : 'ativo'}`}>
                                                    {inativo ? 'Sem acesso' : 'Ativo'}
                                                </span>
                                            </td>
                                            <td className="col-acoes">
                                                {souEu ? (
                                                    <span className="admin-voce">Você</span>
                                                ) : inativo ? (
                                                    <button
                                                        className="success-btn admin-acao-btn"
                                                        onClick={() => setConfirmacao({ usuario, acao: 'reativar' })}
                                                    >
                                                        <FiUserCheck size={16} /><span>Reativar</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="danger-btn admin-acao-btn"
                                                        onClick={() => setConfirmacao({ usuario, acao: 'desativar' })}
                                                    >
                                                        <FiUserX size={16} /><span>Remover acesso</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            <AddUserModal isOpen={modalAddAberto} onClose={() => setModalAddAberto(false)} />
            <ConfirmUserStatusModal
                isOpen={!!confirmacao.usuario}
                usuario={confirmacao.usuario}
                acao={confirmacao.acao}
                onClose={() => setConfirmacao({ usuario: null, acao: null })}
            />
        </>
    );
}

export default AdminPage;
