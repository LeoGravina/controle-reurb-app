// src/firebase/config.js

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';

const firebaseConfig = {
    apiKey: "AIzaSyByqtK3WiTOj-OChgmzR_TJvsQP_YTAOo4",
    authDomain: "controle-reurb-5fd56.firebaseapp.com",
    projectId: "controle-reurb-5fd56",
    storageBucket: "controle-reurb-5fd56.appspot.com",
    messagingSenderId: "295943977011",
    appId: "1:295943977011:web:d7eaa507d7a4c428ca0b46"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Criamos e exportamos as instâncias que serão usadas em todo o app
const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.app().functions('us-central1');
const nucleosCollection = db.collection("nucleos");

export { db, auth, functions, nucleosCollection, firebase };