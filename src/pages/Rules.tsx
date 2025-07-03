import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

export default function Rules() {
  const [loading, setLoading] = useState(true);
  const [rule, setRule] = useState<null | {
    stories_per_week: number;
    posts_per_week: number;
    reels_per_week: number;
    rulesText: string;
  }>(null);

  useEffect(() => {
    const fetchRule = async () => {
      try {
        const res = await axios.get('https://ambassador-tracking-backend-production.up.railway.app/posting-rules');
        const first = res.data[0];
        setRule(first);
      } catch (err) {
        console.error('Failed to load rules');
      } finally {
        setLoading(false);
      }
    };

    fetchRule();
  }, []);

  if (loading) return <Layout><p>Loading rules...</p></Layout>;

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Ambassador Posting Rules</h2>

      {rule ? (
        <div className="bg-white p-6 rounded shadow space-y-4">
          <p className="text-gray-700">
            <strong>Stories per week:</strong> {rule.stories_per_week}
          </p>
          <p className="text-gray-700">
            <strong>Posts per week:</strong> {rule.posts_per_week}
          </p>
          <p className="text-gray-700">
            <strong>Reels per week:</strong> {rule.reels_per_week}
          </p>
          <p className="mt-4 whitespace-pre-line text-gray-800">
            {rule.rulesText || 'No detailed rules available.'}
          </p>
        </div>
      ) : (
        <p className="text-gray-600">No posting rules have been defined yet.</p>
      )}
    </Layout>
  );
}
