// src/pages/Dashboard.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');

    if (!role) {
      navigate('/');
    } else if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'leader') {
      navigate('/leader');
    } else if (role === 'ambassador') {
      navigate('/ambassador');
    } else {
      navigate('/');
    }
  }, [navigate]);

  return <p className="text-center mt-10 text-gray-600">Redirecting...</p>;
}
