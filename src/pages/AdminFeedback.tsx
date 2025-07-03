import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

interface NoteEntry {
  id: string;
  userId: string;
  userName: string;
  role: string;
  message: string;
  createdAt: string;
  archived: boolean;
}

export default function AdminFeedback() {
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Use useCallback to stabilize fetchNotes
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://ambassador-tracking-backend-production.up.railway.app/feedback-forms', {
        params: { search, from, to },
      });
      setNotes(res.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, from, to]);

  // Add fetchNotes as a dependency!
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const visibleNotes = notes.filter((note) => !note.archived);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Feedback & Notes</h2>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-md"
        />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border px-3 py-2 rounded-md"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border px-3 py-2 rounded-md"
        />
        <button
          onClick={fetchNotes}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : visibleNotes.length === 0 ? (
        <p>No feedback or notes found.</p>
      ) : (
        <div className="space-y-4">
          {visibleNotes.map((note) => (
            <div key={note.id} className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-sm text-gray-500 mb-1">
                <span className="font-semibold text-gray-700">{note.userName}</span> ({note.role}) —{' '}
                {new Date(note.createdAt).toLocaleString()}
              </div>
              <p className="text-gray-800 whitespace-pre-line">{note.message}</p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
