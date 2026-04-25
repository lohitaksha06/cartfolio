import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import OrderDetail from "./pages/OrderDetail";
import AddOrder from "./pages/AddOrder";
import Settings from "./pages/Settings";
import VendorDetail from "./pages/VendorDetail";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Navbar />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            background: "var(--bg)",
            padding: "36px",
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Home />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/vendor/:vendor" element={<VendorDetail />} />
            <Route path="/add" element={<AddOrder />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
