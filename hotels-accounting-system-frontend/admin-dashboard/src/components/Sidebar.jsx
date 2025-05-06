import {
  BarChart2,
  DollarSign,
  FileText,
  User,
  CreditCard,
  Home,
  Users,
  Menu,
  ConciergeBell,
  Package,
  Box,
  ShoppingCart,
  Archive,
} from "lucide-react";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useTranslation } from "react-i18next";

const SIDEBAR_ITEMS = [
  {
    name: "dashboard",
    icon: BarChart2,
    color: "#6366f1",
    path: "/",
    roles: ["admin", "manager"],
  },
  {
    name: "reception",
    icon: ConciergeBell,
    color: "#F59E0B",
    path: "/Reception",
    roles: ["admin", "manager", "accountant"],
  },
  {
    name: "service",
    icon: Package,
    color: "#F59E0B",
    path: "/Services",
    roles: ["admin"],
  },
  {
    name: "bookings",
    icon: FileText,
    color: "#34d399",
    path: "/bookings",
    roles: ["admin", "manager", "accountant"],
  },
  {
    name: "orders",
    icon: ShoppingCart,
    color: "#34d399", // Green
    path: "/orders",
    roles: ["admin", "manager", "accountant"],
  },
  {
    name: "Ordersiteams",
    icon: Box, // Box icon
    color: "#60a5fa", // Light Blue
    path: "/orders-items",
    roles: ["admin", "manager", "accountant"],
  },
  {
    name: "itemscategory",
    icon: Archive, // Box icon
    color: "#60a5fa", // Light Blue
    path: "/items-category",
    roles: ["admin", "manager", "accountant"],
  },
  
  {
    name: "expenses",
    icon: DollarSign,
    color: "red",
    path: "/expenses",
    roles: ["admin", "manager", "accountant"],
  },
  {
    name: "financialReports",
    icon: FileText,
    color: "#f87171",
    path: "/financial-reports",
    roles: ["admin", "manager"],
  },
  {
    name: "guests",
    icon: Users,
    color: "#f87171",
    path: "/guests",
    roles: ["admin", "manager", "accountant"],
  },
  {
    name: "payments",
    icon: CreditCard,
    color: "#f472b6",
    path: "/payments",
    roles: ["admin", "manager", "accountant"],
  },
  {
    name: "rooms",
    icon: Home,
    color: "#818cf8",
    path: "/rooms",
    roles: ["admin", "manager"],
  },
  {
    name: "users",
    icon: User,
    color: "#4ade80",
    path: "/users",
    roles: ["admin"],
  },
];

const Sidebar = ({ allowedRoles }) => {
  const { t } = useTranslation("sidebar");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, name, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <motion.div
      className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 overflow-scroll   
        [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar]:h-0
        [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full 
 
        ${isSidebarOpen ? "w-64" : "w-20"}`}
      animate={{ width: isSidebarOpen ? "w-256" : "w-80" }}
    >
      <div className="bg-gray-800 bg-opacity-50  flex flex-col border-r border-gray-700 min-h-full ">
        <motion.button
          whileHover={{ scale: 1.0 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2  bg-opacity-50 backdrop-blur-md   flex items-center gap-2 position-sticky top-0 z-50 "
        >
          <Menu size={24} />
          {isSidebarOpen && (
            <span className="text-white font-medium ">{name || "Guest"}</span>
          )}
        </motion.button>

        <nav className="mt-8 flex-grow h-full">
          {SIDEBAR_ITEMS.map(
            (item, index) =>
              item.roles.includes(role) && (
                <Link to={item.path} key={index}>
                  <motion.div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
                    <item.icon
                      size={20}
                      style={{ color: item.color, minWidth: "20px" }}
                    />
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2, delay: 0.3 }}
                          className="ml-4 whitespace-nowrap"
                        >
                          {t(item.name)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              )
          )}
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;
