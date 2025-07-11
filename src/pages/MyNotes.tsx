import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

interface Note {
  id: string;
  userName: string;
  role: string;
  message: string;
  createdAt: string;
  archived: boolean;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    axios
      .get(`https://ambassador-tracking-backend-production.up.railway.app/notes/user/${userId}`)
      .then((res) => {
        setNotes(res.data);
      })
      .catch((err) => {
        console.error('Error fetching notes:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">My Notes</h1>
        {loading ? (
          <p>Loading...</p>
        ) : notes.length === 0 ? (
          <p>No notes found.</p>
        ) : (
          <ul className="space-y-4">
            {notes.map((note) => (
              <li key={note.id} className="border rounded p-3 shadow">
                <p className="text-sm text-gray-600">From: {note.userName} ({note.role})</p>
                <p>{note.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
