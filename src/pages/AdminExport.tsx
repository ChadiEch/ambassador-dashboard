// src/pages/AdminExport.tsx
import { useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

export default function AdminExport() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const res = await axios.get('https://ambassador-tracking-backend-production.up.railway.app/feedback-forms', {
        responseType: 'json',
      });

      const notes = res.data;
      const header = ['User Name', 'Role', 'Message', 'Created At'];
      const rows = notes.map((n: any) => [
        n.userName,
        n.role,
        '"' + n.message.replace(/"/g, '""') + '"',
        new Date(n.createdAt).toLocaleString(),
      ]);

      const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'notes_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export notes', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Export Feedback & Notes</h2>
      <p className="mb-4 text-gray-600">Click the button below to export all notes as a CSV file.</p>
      <button
        onClick={handleExport}
        disabled={downloading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        {downloading ? 'Exporting...' : 'Download CSV'}
      </button>
    </Layout>
  );
}
