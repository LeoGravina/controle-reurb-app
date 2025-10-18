import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="main-footer">
            <div className="container footer-content">
                <p>Este projeto foi desenvolvido por <strong>Leonardo Gravina Carlos</strong>.</p>
                <p>
                    Quer desenvolver um projeto? <Link to="/contato">Entre em contato</Link>.
                </p>
            </div>
        </footer>
    );
}

export default Footer;