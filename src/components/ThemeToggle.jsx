import { useEffect, useState } from 'react';

const ThemeToggle = () => {
    const [theme, setThemeState] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return userPrefersDark ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setThemeState(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="theme-switch-wrapper">
            <label className="theme-switch">
                <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                />
                <span className="slider"></span>
            </label>
        </div>
    );
};

export default ThemeToggle;