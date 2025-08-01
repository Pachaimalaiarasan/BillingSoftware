import "./index.css";
import React, { createContext, useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';


export const CartContext = createContext();

// --- Modal dialog setup
Modal.setAppElement('#root');

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ADMIN_LOGIN = import.meta.env.VITE_API_ADMIN_LOGIN;
const API_ADMIN_REGISTER = import.meta.env.VITE_API_ADMIN_REGISTER; // <-- Add this in your .env
const API_ADMIN_RESET_PASSWORD = import.meta.env.VITE_API_ADMIN_RESET_PASSWORD;

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotForm, setForgotForm] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
  });
  const [forgotMessage, setForgotMessage] = useState('');

  // --- Google Sign-In state and ref
  const googleBtnDiv = useRef(null);

  // Setup Google Sign-In
  useEffect(() => {
    if (window.google && googleBtnDiv.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(
        googleBtnDiv.current,
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  // --- Regular DB login form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}${API_ADMIN_LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  //  Google Sign-in LOGIN then REGISTER if needed
  async function handleGoogleCredentialResponse(response) {
    // JWT decode function
    function decodeJwt(token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    }
    // Get info from token
    const profile = decodeJwt(response.credential);
    const userName = profile.name;
    const userEmail = profile.email;
    setError("");
    // Compose payload
    const payload = {
      username: userName,
      email: userEmail,
      password: userEmail 
    };
    try {
      // Try to login first
      let res = await fetch(`${API_BASE_URL}${API_ADMIN_LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, password: userEmail })
      });
      if (res.ok) {
        await res.json();
        onLoginSuccess();
        return;
      }
      
      // Register the user
      let registerRes = await fetch(`${API_BASE_URL}${API_ADMIN_REGISTER}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (registerRes.ok) {
        // Registration succeeded & log in
        let loginRes = await fetch(`${API_BASE_URL}${API_ADMIN_LOGIN}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: userName, password: userEmail })
        });
        if (loginRes.ok) {
          await loginRes.json();
          onLoginSuccess();
        } else {
          const data = await loginRes.json();
          setError(data.error || "Google Login after registration failed");
        }
      } else {
        const data = await registerRes.json();
        setError(data.error || "Google Account Registration failed");
      }
    } catch (err) {
      setError('Error with Google Sign-In');
    }
  }

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}${API_ADMIN_RESET_PASSWORD}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forgotForm),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage("Password updated successfully.");
        setIsForgotModalOpen(false);
      } else {
        setForgotMessage(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setForgotMessage("Server error.");
    }
  };

  return (
    <section>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-yellow-50 px-4 py-10">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl border border-black overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel */}
          <div className="md:w-1/2 bg-yellow-200 p-10 flex flex-col items-center justify-center text-center">
            <img src="/images/logo.png" alt="Logo" className="w-40 md:w-56 mb-6" />
            <h2 className="text-xl md:text-2xl font-bold text-black mb-2">Welcome Back!</h2>
            <p className="text-sm text-black">Manage your market with ease and stay on top of your business.</p>
          </div>

          {/* Right Panel */}
          <div className="md:w-1/2 w-full p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-600 mb-6 text-center">Admin Login</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full bg-black text-yellow-400 py-2 rounded-md font-semibold hover:bg-yellow-400 hover:text-black transition duration-300"
              >
                Sign In
              </button>
            </form>
            {/* Google Sign-In Button */}
            <div className="flex justify-center mt-4">
              <div ref={googleBtnDiv}></div>
            </div>
            <div className="text-right text-sm mt-2">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-blue-500 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onRequestClose={() => setIsForgotModalOpen(false)}
        className="bg-white p-6 rounded shadow max-w-md mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start"
      >
        <h2 className="text-xl font-semibold mb-4 text-center text-yellow-600">Reset Password</h2>
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={forgotForm.username}
            onChange={(e) => setForgotForm({ ...forgotForm, username: e.target.value })}
            className="w-full border px-4 py-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Current Password"
            value={forgotForm.currentPassword}
            onChange={(e) => setForgotForm({ ...forgotForm, currentPassword: e.target.value })}
            className="w-full border px-4 py-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={forgotForm.newPassword}
            onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
            className="w-full border px-4 py-2 rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
          >
            Update Password
          </button>
          {forgotMessage && (
            <p className="text-center text-sm text-red-500 mt-2">{forgotMessage}</p>
          )}
        </form>
      </Modal>
    </section>
  );
};

const Root = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState([]);
  return isLoggedIn ?
    <CartContext.Provider value={{ cart, setCart }}>
      <App />
    </CartContext.Provider>
    : <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);


