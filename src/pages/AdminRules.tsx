import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

export default function AdminRules() {
  const [rules, setRules] = useState({
    stories: 0,
    posts: 0,
    reels: 0,
    paragraph: '',
    id: '', // rule id from backend
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await axios.get('http://ambassador-tracking-backend-production.up.railway.app:5000/posting-rules');
        const rule = res.data[0]; // assuming one global rule
        setRules({
          stories: rule.stories_per_week,
          posts: rule.posts_per_week,
          reels: rule.reels_per_week,
          paragraph: rule.rulesText || '',
          id: rule.id,
        });
      } catch (err) {
        console.error('Failed to load rules', err);
      }
    };
    fetchRules();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.patch(`http://ambassador-tracking-backend-production.up.railway.app:5000/posting-rules/${rules.id}`, {
        stories_per_week: rules.stories,
        posts_per_week: rules.posts,
        reels_per_week: rules.reels,
        rulesText: rules.paragraph,
      });
      setStatus('saved');
    } catch (err) {
      console.error('Save failed', err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Age & Posting Rules</h2>

      <div className="bg-white p-6 rounded shadow mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1">Stories / week</label>
            <input
              type="number"
              value={rules.stories}
              onChange={(e) => setRules({ ...rules, stories: Number(e.target.value) })}
              className="border px-3 py-1 rounded w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Posts / week</label>
            <input
              type="number"
              value={rules.posts}
              onChange={(e) => setRules({ ...rules, posts: Number(e.target.value) })}
              className="border px-3 py-1 rounded w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Reels / week</label>
            <input
              type="number"
              value={rules.reels}
              onChange={(e) => setRules({ ...rules, reels: Number(e.target.value) })}
              className="border px-3 py-1 rounded w-full"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1 mt-4">Ambassador Rules Paragraph</label>
          <textarea
            rows={4}
            value={rules.paragraph}
            onChange={(e) => setRules({ ...rules, paragraph: e.target.value })}
            className="border px-3 py-2 rounded w-full"
            placeholder="Explain the rules ambassadors should follow..."
          ></textarea>
        </div>

        <button
          onClick={handleSave}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Rules'}
        </button>

        {status === 'saved' && (
          <p className="text-green-600 mt-2">Rules saved successfully!</p>
        )}
        {status === 'error' && (
          <p className="text-red-600 mt-2">Failed to save rules. Try again.</p>
        )}
      </div>

      {/* Preview */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Preview for Ambassadors</h3>
        <p className="text-gray-800 mb-2">
          Required weekly content: <strong>{rules.stories}</strong> stories,{' '}
          <strong>{rules.posts}</strong> posts, <strong>{rules.reels}</strong> reels.
        </p>
        <p className="text-gray-700 whitespace-pre-line">{rules.paragraph}</p>
      </div>
    </Layout>
  );
}
