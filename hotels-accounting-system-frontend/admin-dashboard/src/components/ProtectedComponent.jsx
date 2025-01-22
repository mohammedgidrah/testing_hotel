import { useAuth } from "../Context/AuthContext";


const ProtectedComponent = ({ allowedRoles, children }) => {
    const { role } = useAuth();

    if (!allowedRoles.includes(role)) {
        return <p>Unauthorized</p>;
    }

    return <>{children}</>;
};

export default ProtectedComponent;
