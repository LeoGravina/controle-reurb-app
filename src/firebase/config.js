// src/firebase/config.js

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Sua configuração do Firebase que estava no script.js
const firebaseConfig = {
    apiKey: "AIzaSyByqtK3WiTOj-OChgmzR_TJvsQP_YTAOo4",
    authDomain: "controle-reurb-5fd56.firebaseapp.com",
    projectId: "controle-reurb-5fd56",
    storageBucket: "controle-reurb-5fd56.appspot.com",
    messagingSenderId: "295943977011",
    appId: "1:295943977011:web:d7eaa507d7a4c428ca0b46"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Exporta a instância do Firestore Database para ser usada em outros lugares
const db = firebase.firestore();
const nucleosCollection = db.collection("nucleos");

export { db, nucleosCollection };