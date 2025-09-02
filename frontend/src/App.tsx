// import { LoginForm } from "./components/login-form";
import Layout from "./components/layout";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import SetupProcess from "./pages/SetupProcess";
import AdminConnection from "./pages/AdminConnection";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { ToastContainer } from 'react-toastify';

const socket = io("http://192.168.1.2:3001", {
  transports: ["websocket"],
});

function App() {
  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("Message received:", data);
    });

    socket.on("postgres_binary_progress", (data) => {
      console.log("Postgres binary progress:", data);
    });

    return () => {
      socket.off("receive_message");
      socket.off("postgres_binary_progress");
    };
  }, []);

  return (
    <section className="min-h-screen bg-background">
      <ToastContainer />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/setup-process" element={<SetupProcess />} />
          <Route path="/admin-connection" element={<AdminConnection />} />

          {/* Protected / Layout Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </section>
  );
}

export default App;
