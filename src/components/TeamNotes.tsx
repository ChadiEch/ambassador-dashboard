// src/components/TeamNotes.tsx
import { useState } from 'react';
import axios from 'axios';

interface TeamNotesProps {
  memberId: string;
  memberName: string;
}

export default function TeamNotes({ memberId, memberName }: TeamNotesProps) {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  const handleSubmit = async () => {
    try {
      await axios.post('https://ambassador-tracking-backend-production.up.railway.app/notes/team-leader', {
        ambassadorId: memberId,
        message: note,
      });
      setNote('');
      setStatus('sent');
    } catch (err) {
      console.error('Failed to send note:', err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-gray-50 p-4 mt-4 rounded-lg border">
      <h4 className="font-semibold mb-2 text-sm">Note for {memberName}</h4>
      <textarea
        className="w-full p-2 border rounded-md mb-2"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write a comment or feedback..."
      ></textarea>
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 text-sm"
      >
        Submit Note
      </button>
      {status === 'sent' && <p className="text-green-600 text-sm mt-1">Note sent!</p>}
      {status === 'error' && <p className="text-red-600 text-sm mt-1">Failed to send.</p>}
    </div>
  );
}
