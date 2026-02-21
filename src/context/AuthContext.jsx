/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            return JSON.parse(storedUser);
        }
        return null;
    });
    const loading = false; // Hardcode loading to false as state is synchronous now

    useEffect(() => {
        // Initialization is now handled synchronously in useState
    }, []);

    const login = async (email, password) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    const signup = async (name, email, password) => {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data; // { success: true, message: '...' }
    };

    const verifyEmail = async (email, code) => {
        const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Optional: clear other app state if needed
    };

    const resendCode = async (email) => {
        const response = await fetch('/api/auth/resend-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
    };

    const updateProfile = async (name, email) => {
        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, email }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Update local user state
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return data.user;
    };

    const changePassword = async (currentPassword, newPassword) => {
        const response = await fetch('/api/auth/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
    };

    const deleteAccount = async () => {
        const response = await fetch('/api/auth/account', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        logout(); // Clear local state and redirect
        return data;
    };

    const forgotPassword = async (email) => {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data; // { success: true, message: '...' }
    };

    const resetPassword = async (email, code, newPassword) => {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, newPassword }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data; // { success: true, message: '...' }
    };

    const value = {
        user,
        loading,
        login,
        signup,
        verifyEmail,
        logout,
        resendCode,
        updateProfile,
        changePassword,
        deleteAccount,
        forgotPassword,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
