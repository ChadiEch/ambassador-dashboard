import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import FeedbackForm from '../components/FeedbackForm';

interface ComplianceData {
  actual: {
    stories: number;
    posts: number;
    reels: number;
  };
  expected: {
    stories: number;
    posts: number;
    reels: number;
  };
  compliance: {
    story: string;
    post: string;
    reel: string;
  };
  name: string;
  photoUrl?: string;
}

export default function AmbassadorDashboard() {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - 6);
    return fromDate.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchData = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('No user ID found in localStorage.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        'https://ambassador-tracking-backend-production.up.railway.app/analytics/weekly-compliance',
        {
          params: { userId, from: startDate, to: endDate },
        }
      );
      setData(res.data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching compliance:', err);
      setError('Failed to fetch compliance data.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">Weekly Activity Summary</h2>

      {/* ✅ Profile section */}
      {data && (
        <div className="flex items-center mb-4 space-x-4">
          {data.photoUrl && (
            <img
              src={data.photoUrl}
              alt="Profile"
              className="w-16 h-16 object-cover rounded border"
            />
          )}
          <div>
            <h3 className="text-xl font-semibold">{data.name}</h3>
            <p className="text-gray-600 text-sm">Ambassador</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input
          type="date"
          className="border px-3 py-1 rounded text-sm"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-1 rounded text-sm"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          onClick={fetchData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
        >
          Refresh
        </button>
        <p className="text-sm text-gray-500">Last updated: {lastUpdate}</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['stories', 'posts', 'reels'] as const).map((type) => {
            const complianceKey = type === 'stories' ? 'story' : type === 'posts' ? 'post' : 'reel';
            const expected = data.expected[type];
            const actual = data.actual[type];
            const isGreen = data.compliance[complianceKey] === 'green';
            const isZeroRequirement = expected === 0;
            const bgColor = isZeroRequirement
              ? 'bg-yellow-500'
              : isGreen
              ? 'bg-green-500'
              : 'bg-red-500';

            return (
              <div
                key={type}
                className={`p-6 rounded-xl shadow-md text-white ${bgColor}`}
              >
                <h3 className="text-xl font-bold capitalize">{type}</h3>
                <p className="text-sm">
                  {actual} of {expected} required
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-red-500">No compliance data available.</p>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Give Feedback</h3>
        <FeedbackForm />
      </div>
    </Layout>
  );
}
