import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  instagram?: string;
  role: 'ambassador' | 'leader' | 'admin';
  active: boolean;
}

interface ManualActivity {
  id: string;
  mediaType: string;
  timestamp: string;
  permalink: string;
}

export default function AdminManualActivity() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [mediaType, setMediaType] = useState<'post' | 'reel'>('post');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('12:00');
  const [activities, setActivities] = useState<ManualActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://ambassador-tracking-backend-production.up.railway.app/admin/users');
        setUsers(response.data.filter((user: User) => user.role === 'ambassador'));
      } catch (err) {
        console.error('Failed to load users', err);
        setMessage({ type: 'error', text: 'Failed to load users' });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch activities for selected user
  useEffect(() => {
    const fetchActivities = async () => {
      if (!selectedUser) {
        setActivities([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`https://ambassador-tracking-backend-production.up.railway.app/manual-activity/user/${selectedUser}`);
        setActivities(response.data);
      } catch (err) {
        console.error('Failed to load activities', err);
        setMessage({ type: 'error', text: 'Failed to load activities' });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [selectedUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Please select an ambassador' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // Combine date and time
      const dateTime = new Date(`${date}T${time}:00`);
      
      const response = await axios.post('https://ambassador-tracking-backend-production.up.railway.app/manual-activity', {
        userId: selectedUser,
        mediaType,
        timestamp: dateTime.toISOString(),
      });

      if (response.data) {
        setMessage({ type: 'success', text: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} recorded successfully!` });
        // Refresh activities
        const activitiesResponse = await axios.get(`https://ambassador-tracking-backend-production.up.railway.app/manual-activity/user/${selectedUser}`);
        setActivities(activitiesResponse.data);
        
        // Reset form
        setMediaType('post');
        setDate(new Date().toISOString().split('T')[0]);
        setTime('12:00');
      }
    } catch (err) {
      console.error('Failed to record activity', err);
      setMessage({ type: 'error', text: 'Failed to record activity' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Manual Activity Entry</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Record New Activity</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ambassador</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  disabled={loading}
                >
                  <option value="">Select an ambassador</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} {user.instagram ? `(${user.instagram})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as 'post' | 'reel')}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="post">Post</option>
                  <option value="reel">Reel</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={submitting || loading || !selectedUser}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Record Activity'}
            </button>
          </form>
        </div>

        {selectedUser && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Manual Activities</h3>
            
            {loading ? (
              <p>Loading activities...</p>
            ) : activities.length === 0 ? (
              <p className="text-gray-500">No manual activities recorded for this ambassador yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            activity.mediaType === 'post' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {activity.mediaType.charAt(0).toUpperCase() + activity.mediaType.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.id.substring(0, 8)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}