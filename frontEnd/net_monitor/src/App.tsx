import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './i18n';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import Login from "./screens/login/Login";
import { ToastContainer } from "react-toastify";
import Dashboard from "./screens/dashboard/Dashboard";
import Routers from "./screens/routers/Routers";
import Layout from "./components/Layout";
import Transmitters from "./screens/transmitters/Transmitters";
import Switches from "./screens/switches/Switches";
import RouterSnmpMonitor from "./screens/routerSnmpMonitor/RouterSnmpMonitor";
import RouterDashboard from "./screens/routerSnmpMonitor/RouterDashboard";
import RouterInterfaces from "./screens/routerSnmpMonitor/RouterInterfaces";
import RouterVlans from "./screens/routerSnmpMonitor/RouterVlans";

export type APIError = {
  error : {
    code: string;
    message: string;
  };
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div>
            <Routes>
              <Route
                path="/"
                element={<Layout />}
              >
                <Route
                  path="/routers"
                  element={
                    <ProtectedRoute>
                      <Routers />
                    </ProtectedRoute>
                  }
                />

                <Route 
                  path="/transmitters"
                  element={
                    <ProtectedRoute>
                      <Transmitters />
                    </ProtectedRoute>
                  }
                />

                <Route 
                  path="/switches"
                  element={
                    <ProtectedRoute>
                      <Switches />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/router/:routerId"
                  element={
                    <ProtectedRoute>
                      <RouterSnmpMonitor />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<RouterDashboard />} />
                  <Route path="interfaces" element={<RouterInterfaces />} />
                  <Route path="vlans" element={<RouterVlans />} />
                </Route>
                
                <Route 
                  path="/" 
                  element={<Navigate to="/dashboard" replace />} 
                />
                
                <Route 
                  path="*" 
                  element={<Navigate to="/dashboard" replace />} 
                />
              </Route>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
        
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </LanguageProvider>
  );
}