// src/pages/LoginPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
// 1. CORREÇÃO: Importando 'auth' centralizado e o logo
import { db, auth } from '../firebase/config';
import logoPrefeitura from '../assets/logo-prefeitura.png';

function LoginPage() {
    console.log("ID do Projeto lido do .env:", import.meta.env.VITE_FIREBASE_PROJECT_ID);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where("username", "==", username.trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("Usuário não encontrado.");
            }

            const userDoc = querySnapshot.docs[0].data();
            const email = userDoc.email;

            // 3. CORREÇÃO: Usando a instância 'auth' importada para consistência
            await auth.signInWithEmailAndPassword(email, password);

            navigate('/');

        } catch (err) {
            setError("Falha no login. Verifique seu usuário e senha.");
            console.error("Erro de login:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
            <form onSubmit={handleLogin} style={{ padding: '40px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', boxShadow: 'var(--shadow)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                
                {/* 2. ADIÇÃO: Adicionando o elemento da imagem do logo */}
                <img src={logoPrefeitura} alt="Logo da Prefeitura" className="login-logo" />

                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Controle REURB</h2>
                
                <div className="form-group" style={{ textAlign: 'left' }}>
                    <label>Usuário</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="nome.sobrenome" required />
                </div>
                <div className="form-group" style={{ textAlign: 'left' }}>
                    <label>Senha</label>
                    {/* 4. MANTIDO: Placeholder original restaurado */}
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******" required />
                </div>
                
                {error && <p style={{ color: 'var(--danger-color)', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
                
                <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;