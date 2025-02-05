import { BarChart2, DollarSign, FileText, User, CreditCard, Home, Users, Menu } from 'lucide-react'
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { useTranslation } from 'react-i18next';
import { ConciergeBell } from "lucide-react";


const SIDEBAR_ITEMS = [
    {
        name: "reception",
        icon: ConciergeBell,
        color: "#F59E0B",
        path: "/Reception",
        roles: ["admin", "manager", "accountant"]
    },
    {
        name: "dashboard",
        icon: BarChart2,
        color: "#6366f1",
        path: "/",
        roles: ["admin", "manager"]
    },
    {
        name: "bookings",
        icon: FileText,
        color: "#34d399",
        path: "/bookings",
        roles: ["admin", "manager", "accountant"]
    },
    {
        name: "expenses",
        icon: DollarSign,
        color: "red",
        path: "/expenses",
        roles: ["admin", "manager", "accountant"]
    },
    {
        name: "financialReports",
        icon: FileText,
        color: "#f87171",
        path: "/financial-reports",
        roles: ["admin", "manager"]
    },
    {
        name: "guests",
        icon: Users,
        color: "#f87171",
        path: "/guests",
        roles: ["admin", "manager", "accountant"]
    },
    {
        name: "payments",
        icon: CreditCard,
        color: "#f472b6",
        path: "/payments",
        roles: ["admin", "manager", "accountant"]
    },
    {
        name: "rooms",
        icon: Home,
        color: "#818cf8",
        path: "/rooms",
        roles: ["admin", "manager"]
    },
    {
        name: "users",
        icon: User,
        color: "#4ade80",
        path: "/users",
        roles: ["admin"]
    }
];

const Sidebar = ({ allowedRoles }) => {
    const { t } = useTranslation("sidebar");
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const { isAuthenticated, role } = useAuth();
    
    if (!isAuthenticated) {
        return (
            <Navigate to="/" replace />
        );
    }

    return (
        <motion.div
            className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? "w-64" : "w-20"}`}
            animate={{ width: isSidebarOpen ? "w-256" : "w-80" }}
        >
            <div className='h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit'
                >
                    <Menu size={24} />
                </motion.button>
                <nav className='mt-8 flex-grow'>
                    {SIDEBAR_ITEMS.map((item, index) => (
                        (item.roles.includes(role)) ? (
                            <Link
                                to={item.path}
                                key={index}
                            >
                                <motion.div className='flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors mb-2'>
                                    <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
                                    <AnimatePresence>
                                        {isSidebarOpen && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2, delay: 0.3 }}
                                                className='ml-4 whitespace-nowrap'
                                            >
                                                {t(item.name)}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        ) : null
                    ))}
                </nav>
            </div>
        </motion.div >
    );
};

export default Sidebar;
