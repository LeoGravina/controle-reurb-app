// src/context/AuthContext.jsx

import { createContext, useState, useEffect, useContext } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Gerenciamento do Tema agora vive aqui, no topo da árvore
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        const userPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        return userPrefersDark ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        let unsubscribeProfile; // Variável para o listener do perfil

        const unsubscribeAuth = firebase.auth().onAuthStateChanged(user => {
            setCurrentUser(user);

            // Se o listener do perfil anterior existir, cancela ele
            if (unsubscribeProfile) unsubscribeProfile();

            if (user) {
                // USA O onSnapshot para ouvir em tempo real
                const userDocRef = db.collection('users').doc(user.uid);
                unsubscribeProfile = userDocRef.onSnapshot(doc => {
                    if (doc.exists) {
                        setUserProfile(doc.data());
                    } else {
                        setUserProfile(null); 
                    }
                    setLoading(false);
                });
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        // Função de limpeza
        return () => {
            unsubscribeAuth();
            if (unsubscribeProfile) unsubscribeProfile();
        };
    }, []);

    const value = {
        currentUser,
        userProfile,
        theme,     // Fornece o tema
        setTheme   // Fornece a função para alterar o tema
    };
    
    if (loading) {
        return <h1>Carregando...</h1>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}