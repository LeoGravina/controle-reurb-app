// src/pages/ContatoPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiPhone, FiLinkedin, FiGithub } from 'react-icons/fi';

function ContatoPage() {
    const navigate = useNavigate();

    return (
        <main className="container contato-page-content">
            <div className="contato-card">
                <h1 className="contato-title">Leonardo Gravina Carlos</h1>
                <p className="contato-subtitle">Desenvolvedor de Software</p>

                <div className="contato-info-list">
                    <a href="mailto:leonardocarlos807@gmail.com" className="contato-item">
                        <FiMail size={20} />
                        <span>leonardocarlos807@gmail.com</span>
                    </a>
                    <a href="https://wa.me/5532984057124" target="_blank" rel="noopener noreferrer" className="contato-item">
                        <FiPhone size={20} />
                        <span>(32) 98405-7124</span>
                    </a>
                    <a href="https://www.linkedin.com/in/leonardo-gravina-a770bb237" target="_blank" rel="noopener noreferrer" className="contato-item">
                        <FiLinkedin size={20} />
                        <span>LinkedIn</span>
                    </a>
                    <a href="https://github.com/LeoGravina" target="_blank" rel="noopener noreferrer" className="contato-item">
                        <FiGithub size={20} />
                        <span>GitHub</span>
                    </a>
                </div>

                <button className="secondary-btn" onClick={() => navigate(-1)}>
                    Voltar
                </button>
            </div>
        </main>
    );
}

export default ContatoPage;