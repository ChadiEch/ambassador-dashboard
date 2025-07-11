import { useState } from 'react';
import axios from 'axios';

interface Props {
  memberId: string;
  memberName: string;
}

export default function TeamNotes({ memberId, memberName }: Props) {
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await axios.post('https://ambassador-tracking-backend-production.up.railway.app/notes', {
        content,
        targetUserId: memberId,
      });
      setSuccess(true);
      setContent('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to send note', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        className="w-full border rounded p-2 text-sm"
        placeholder={`Send a note to ${memberName}`}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded"
      >
        {loading ? 'Sending...' : 'Send Note'}
      </button>
      {success && <p className="text-green-600 text-sm mt-1">Note sent!</p>}
    </div>
  );
}
