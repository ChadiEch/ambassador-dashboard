// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      const response = await loginRequest(username, password);
      const { token, role, userId } = response;

      // Save token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('role', role);

      login(userId, role);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err?.response?.data?.message || 'Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-6">Ambassador Tracker</h1>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm text-gray-800">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-md"
        />
        <button
          onClick={handleLogin}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
        >
          Login
        </button>
      </div>
    </div>
  );
}
