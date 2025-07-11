import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

interface Note {
  id: string;
  targetName: string;
  content: string;
  createdAt: string;
}

export default function MyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    axios
      .get('https://ambassador-tracking-backend-production.up.railway.app/notes/mine', {
        params: { userId },
      })
      .then((res) => setNotes(res.data))
      .catch((err) => console.error('Error loading notes', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">My Notes</h2>
      {loading ? (
        <p>Loading...</p>
      ) : notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <ul className="space-y-4">
          {notes.map((note) => (
            <li key={note.id} className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500 mb-1">
                To: <span className="font-medium">{note.targetName}</span> •{' '}
                {new Date(note.createdAt).toLocaleString()}
              </div>
              <p>{note.content}</p>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
