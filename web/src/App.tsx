import { Route, Routes, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function isAuthed() {
  return !!localStorage.getItem("tdb_admin_token");
}

function AdminGuard({ children }: { children: JSX.Element }) {
  return isAuthed() ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen">


      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
