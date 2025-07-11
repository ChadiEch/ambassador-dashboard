import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

interface Note {
  id: string;
  userName: string;
  role: string;
  content: string;
   author: {
    name: string;
  };
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
  <div key={note.id} className="p-4 bg-gray-100 rounded mb-4">
    <p className="text-sm text-gray-600">
      From: <strong>{note.author?.name || 'Unknown'}</strong>
    </p>
    <p className="text-xs text-gray-500">
      {new Date(note.createdAt).toLocaleString()}
    </p>
    <p className="mt-2">{note.content}</p>
  </div>
))}

          </ul>
        )}
      </div>
    </Layout>
  );
}
