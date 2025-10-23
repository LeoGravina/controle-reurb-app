// src/pages/LoginPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import logoPrefeitura from '../assets/logo-prefeitura.png';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // 1. Importar ícones

function LoginPage() {
    console.log("ID do Projeto lido do .env:", import.meta.env.VITE_FIREBASE_PROJECT_ID);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // 2. Estado para visibilidade
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        // ... sua função handleLogin ...
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where("username", "==", username.trim()));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) { throw new Error("Usuário não encontrado."); }
            const userDoc = querySnapshot.docs[0].data();
            const email = userDoc.email;
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
                
                {error && <p className="login-error">{error}</p>}
                
                <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;