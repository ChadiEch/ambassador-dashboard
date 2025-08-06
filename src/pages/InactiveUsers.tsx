import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

interface DeactivationInfo {
  date: string;
  rating: number;
  note?: string;
}

interface InactiveUser {
  id: string;
  name: string;
  phone?: string;
  note?: string; // general user note
  active?: boolean;
  dateOfParticipation?: string;
  deactivations?: DeactivationInfo[]; // array of deactivations
}

export default function InactiveUsers() {
  const [users, setUsers] = useState<InactiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInactiveUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('https://ambassador-tracking-backend-production.up.railway.app/admin/users');
      const inactive = res.data.filter((user: InactiveUser) => user.active === false);
      setUsers(inactive);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load inactive users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveUsers();
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Inactive Users</h2>
      <button 
        onClick={fetchInactiveUsers} 
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Refresh
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : users.length === 0 ? (
        <p>No inactive users found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => {
            const latestDeactivation = user.deactivations?.[user.deactivations.length - 1];
            return (
              <div key={user.id} className="border p-4 rounded shadow">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                <p><strong>Date of Participation:</strong> {user.dateOfParticipation || 'Unknown'}</p>
                <p><strong>Date of Leave:</strong> {latestDeactivation?.date ? new Date(latestDeactivation.date).toLocaleDateString() : 'Unknown'}</p>
                <p><strong>Rating:</strong> {latestDeactivation?.rating ?? 'N/A'}</p>
                <p><strong>Note:</strong> {latestDeactivation?.note || user.note || 'No notes'}</p>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
