import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import OrdersManager from './components/OrdersManager.jsx';
import MenuViewer from './components/MenuViewer.jsx';
import PaymentsManager from './components/PaymentsManager.jsx';
import DeliveryManager from './components/DeliveryManager.jsx';
function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
}

export default function App() {
    return (
        <div className="app">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <PrivateRoute>
                            <OrdersManager />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/menu"
                    element={
                        <PrivateRoute>
                            <MenuViewer />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/payments"
                    element={
                        <PrivateRoute>
                            <PaymentsManager />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/delivery"
                    element={
                        <PrivateRoute>
                            <DeliveryManager />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </div>
    );
}