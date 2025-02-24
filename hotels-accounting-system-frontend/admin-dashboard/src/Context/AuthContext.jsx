import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState(null);
    const [name, setName] = useState(null);

    useEffect(() => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                setIsAuthenticated(true);
                setRole(decoded.role); // Set role from decoded token
                setName(decoded.name); // Set name from decoded token
            } catch (error) {
                console.error("Error decoding the token:", error);
                setIsAuthenticated(false);
            }
        } else {
            setIsAuthenticated(false); // If no token, not authenticated
        }
    }, []); // Only run on mount

    const login = (token) => {
        localStorage.setItem('token', token);
        try {
            const decoded = jwtDecode(token);
            setIsAuthenticated(true);
            setRole(decoded.role);
            setName(decoded.name); // Make sure the token contains these fields
        } catch (error) {
            console.error("Error decoding the token:", error);
            setIsAuthenticated(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setRole(null);
        setName(null); // Reset name on logout
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, name, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
