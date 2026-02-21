/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Check local storage or system preference
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const [neonMode, setNeonMode] = useState(() => {
        const storedNeon = localStorage.getItem('neonMode');
        return storedNeon !== null ? storedNeon === 'true' : true;
    });

    const [neonHoverMode, setNeonHoverMode] = useState(() => {
        const storedNeonHover = localStorage.getItem('neonHoverMode');
        return storedNeonHover !== null ? storedNeonHover === 'true' : false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (neonMode && !neonHoverMode) {
            window.document.body.setAttribute('data-neon', 'true');
            window.document.body.removeAttribute('data-neon-hover');
        } else if (neonMode && neonHoverMode) {
            window.document.body.removeAttribute('data-neon');
            window.document.body.setAttribute('data-neon-hover', 'true');
        } else {
            window.document.body.removeAttribute('data-neon');
            window.document.body.removeAttribute('data-neon-hover');
        }
        localStorage.setItem('neonMode', neonMode);
        localStorage.setItem('neonHoverMode', neonHoverMode);
    }, [neonMode, neonHoverMode]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const toggleNeonMode = () => {
        setNeonMode(prev => !prev);
    };

    const toggleNeonHoverMode = () => {
        setNeonHoverMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, neonMode, toggleNeonMode, neonHoverMode, toggleNeonHoverMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
