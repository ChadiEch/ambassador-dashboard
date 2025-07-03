import { useEffect, useState } from 'react';
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
}

export default function AmbassadorDashboard() {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('No user ID found in localStorage.');
        setLoading(false);
        return;
      }

      const today = new Date();
      const to = today.toISOString().split('T')[0];
      const fromDate = new Date(today);
      fromDate.setDate(fromDate.getDate() - 6);
      const from = fromDate.toISOString().split('T')[0];

      try {
        const res = await axios.get(`https://ambassador-tracking-backend-production.up.railway.app/analytics/weekly-compliance`, {
          params: { userId, from, to },
        });
        setData(res.data);
      } catch (err) {
        console.error('Error fetching compliance:', err);
        setError('Failed to fetch compliance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">Weekly Activity Summary</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['stories', 'posts', 'reels'] as const).map((type) => {
            const complianceKey = type === 'stories' ? 'story' : type === 'posts' ? 'post' : 'reel';
            return (
              <div
                key={type}
                className={`p-6 rounded-xl shadow-md text-white ${
                  data.compliance[complianceKey] === 'green' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                <h3 className="text-xl font-bold capitalize">{type}</h3>
                <p className="text-sm">
                  {data.actual[type]} of {data.expected[type]} required
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-red-500">No compliance data available.</p>
      )}

      {/* Feedback Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Give Feedback</h3>
        <FeedbackForm />
      </div>
    </Layout>
  );
}
