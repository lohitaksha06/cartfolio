import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import OrderDetail from "./pages/OrderDetail";
import AddOrder from "./pages/AddOrder";
import Settings from "./pages/Settings";
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
            padding: "32px",
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/orders" replace />} />
            <Route path="/orders" element={<Home />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/add" element={<AddOrder />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
