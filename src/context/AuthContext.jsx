// src/context/AuthContext.jsx

import { createContext, useState, useEffect, useContext } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { db } from '../firebase/config'; // Precisamos do db aqui

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // NOVO: Estado para o perfil do Firestore
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
            setCurrentUser(user);
            if (user) {
                // Se houver um usuário, busque seu perfil no Firestore
                const userDocRef = db.collection('users').doc(user.uid);
                const userDoc = await userDocRef.get();
                if (userDoc.exists) {
                    setUserProfile(userDoc.data());
                } else {
                    // Opcional: Lidar com o caso de um usuário autenticado não ter perfil
                    setUserProfile(null); 
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile // NOVO: Fornecendo o perfil para o resto do app
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