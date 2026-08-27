// src/pages/LoginPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db, auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import logoPrefeitura from '../assets/logo-prefeitura.png';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // 1. Importar ícones

function LoginPage() {
    console.log("ID do Projeto lido do .env:", import.meta.env.VITE_FIREBASE_PROJECT_ID);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // 2. Estado para visibilidade
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { accessDenied, clearAccessDenied } = useAuth();

    // Usuário que foi desativado enquanto usava o sistema cai aqui deslogado
    useEffect(() => {
        if (accessDenied) {
            toast.error("Seu acesso foi desativado por um administrador.", { toastId: 'acesso-desativado' });
            clearAccessDenied();
        }
    }, [accessDenied, clearAccessDenied]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        clearAccessDenied();

        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where("username", "==", username.trim()));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) { throw new Error("Usuário não encontrado."); }
            const userDoc = querySnapshot.docs[0].data();
            const email = userDoc.email;

            // Acesso removido pelo administrador
            if (userDoc.status === 'inativo') {
                const acessoRemovido = new Error("Acesso desativado.");
                acessoRemovido.acessoRemovido = true;
                throw acessoRemovido;
            }

            await auth.signInWithEmailAndPassword(email, password);
            navigate('/');
        } catch (err) {
            if (err.acessoRemovido) {
                toast.error("Seu acesso foi desativado. Procure um administrador.", { toastId: 'login-erro' });
            } else {
                toast.error("Falha no login. Verifique seu usuário e senha.", { toastId: 'login-erro' });
            }
            console.error("Erro de login:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
            <form onSubmit={handleLogin} style={{ padding: '40px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', boxShadow: 'var(--shadow)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>

                <img src={logoPrefeitura} alt="Logo da Prefeitura" className="login-logo" />
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Controle REURB</h2>

                <div className="form-group" style={{ textAlign: 'left' }}>
                    <label>Usuário</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="nome.sobrenome" required />
                </div>

                {/* 3. Campo de Senha Modificado */}
                <div className="form-group password-input-wrapper" style={{ textAlign: 'left' }}>
                    <label>Senha</label>
                    <input
                        type={showPassword ? 'text' : 'password'} // Muda o tipo dinamicamente
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="******"
                        required
                    />
                    <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)} // Ação de clique
                        aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                    >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                </div>

                <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;
