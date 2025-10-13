
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { useAuth } from '../context/AuthContext';

function UserDropdown() {
    const { userProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        await firebase.auth().signOut();
        navigate('/login');
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [dropdownRef]);

    if (!userProfile) return null;

    return (
        <div className="user-dropdown" ref={dropdownRef}>
            <button className="user-dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
                <span className="user-avatar">{userProfile.fullName.charAt(0)}</span>
                <span className="user-greeting">Olá, {userProfile.fullName.split(' ')[0]}</span>
                <svg className={`chevron-icon ${isOpen ? 'open' : ''}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            
            <div className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
                <Link to="/perfil" className="dropdown-item" onClick={() => setIsOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>Meu Perfil</span>
                </Link>
                <div className="dropdown-separator"></div>
                <button onClick={handleLogout} className="dropdown-item danger">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
}

export default UserDropdown;