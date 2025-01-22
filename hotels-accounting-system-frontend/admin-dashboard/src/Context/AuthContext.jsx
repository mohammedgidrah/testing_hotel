import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState(null);

    useEffect(() => {

        // Check if token exists in localStorage when the app loads
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            const decoded = jwtDecode(token);
            setRole(decoded.role);
        }
    }, []);

    const login = (token) => {

        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        const decoded = jwtDecode(token);
        console.log(decoded);
        setRole(decoded.role);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
