// src/components/FeedbackForm.tsx
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const { userId } = useAuth();

  const handleSubmit = async () => {
    try {
    await axios.post('http://ambassador-tracking-backend-production.up.railway.app:5000/feedback-forms', {

        userId,
        message,
      });
      setMessage('');
      setStatus('sent');
    } catch (err) {
      console.error('Failed to send feedback:', err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h3 className="text-lg font-semibold mb-2">Send Feedback to Admin</h3>
      <textarea
        className="w-full border rounded-md p-2 mb-2"
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your message..."
      ></textarea>
      <button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        Submit
      </button>
      {status === 'sent' && <p className="text-green-600 mt-2">Feedback sent!</p>}
      {status === 'error' && <p className="text-red-600 mt-2">Failed to send.</p>}
    </div>
  );
}
