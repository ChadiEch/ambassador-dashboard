// pages/InactiveUsers.tsx
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

interface InactiveUser {
  id: string;
  name: string;
  phone?: string;
  note?: string;
  active?: boolean;
}

export default function InactiveUsers() {
  const [users, setUsers] = useState<InactiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInactiveUsers = async () => {
      try {
        const res = await axios.get('https://ambassador-tracking-backend-production.up.railway.app/admin/users');
        const inactive = res.data.filter((user: InactiveUser) => user.active === false);
        setUsers(inactive);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInactiveUsers();
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Inactive Users</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => (
            <div key={user.id} className="border p-4 rounded shadow">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
              <p><strong>Note:</strong> {user.note || 'No notes'}</p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
