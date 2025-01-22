import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';


const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, role } = useAuth();
    const location = useLocation();
    if (!isAuthenticated) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
    return children;
};

export default PrivateRoute;


