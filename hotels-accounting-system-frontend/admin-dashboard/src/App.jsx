import { Route, Routes } from "react-router-dom";
import { useAuth } from './Context/AuthContext';
import Bookings from "./pages/Bookings";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import FinancialReports from "./pages/FinancialReports";
import Guests from "./pages/Guests";
import Payments from "./pages/Payments";
import Rooms from "./pages/Rooms";
import Users from "./pages/Users";
import Sidebar from "./components/Sidebar";
import EditBookings from "./pages/EditBookings";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Unauthorized from "./components/Unauthorized";
import 'bootstrap/dist/css/bootstrap.min.css';
import Reception from "./pages/Reception";
import Services from "./pages/services";
import Orders from "./pages/Orders";
import Ordersiteams from "./pages/Ordersiteams";
import Itempage from "./pages/itemspage";
import Categoryitems from "./pages/categoryitems";



function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden ">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-gray-700 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>
      {/* Sidebar */}
      {isAuthenticated && <Sidebar allowedRoles={['admin', 'manager', 'accountant']} />}
      {/* Content */}
      <Routes>
        {/* Public Route for Login */}
        <Route path="/" element={<Login />} />
        {/* Private Routes */}
        <Route
        path="/Reception"
        element={
          <PrivateRoute allowedRoles={['admin', 'manager', 'accountant']}>
            <Reception />
          </PrivateRoute>
        }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin', 'manager']}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/Services"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Services />
            </PrivateRoute>
          }
        />
        <Route
          path="/items-category"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Categoryitems />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'accountant']}>
              <Bookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/booking-items"
          element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'accountant']}>
              <Itempage />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings/edit/:id"
          element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'accountant']}>
              <EditBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'accountant']}>
              <Expenses />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'accountant']}>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders-items"
          element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'accountant']}>
              <Ordersiteams />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial-reports"
          element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'accountant']}>
              <FinancialReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/guests"
          element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'accountant']}>
              <Guests />
            </PrivateRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'accountant']}>
              <Payments />
            </PrivateRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <PrivateRoute allowedRoles={['admin', 'manager']}>
              <Rooms />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Users />
            </PrivateRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </div>
  );
}
export default App;
