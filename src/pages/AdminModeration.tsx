// src/pages/AdminModeration.tsx
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

interface Note {
  id: string;
  userName: string;
  role: string;
  message: string;
  createdAt: string;
  archived: boolean;
}

export default function AdminModeration() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/feedback-forms');
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleArchive = async (id: string) => {
    try {
     await axios.patch(`http://localhost:5000/feedback-forms/${id}/toggle-archive`);
      fetchNotes();
    } catch (err) {
      console.error('Failed to update note', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Moderation Panel</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <div key={note.id} className="bg-white p-4 rounded shadow-md">
              <div className="text-sm text-gray-600 mb-1">
                <strong>{note.userName}</strong> ({note.role}) — {new Date(note.createdAt).toLocaleString()}
              </div>
              <p className="mb-2">{note.message}</p>
              <button
                onClick={() => toggleArchive(note.id)}
                className={`px-4 py-1 rounded text-white text-sm ${note.archived ? 'bg-yellow-500' : 'bg-gray-700'}`}
              >
                {note.archived ? 'Unarchive' : 'Archive'}
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
