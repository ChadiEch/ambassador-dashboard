import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import TeamNotes from '../components/TeamNotes';
import FeedbackForm from '../components/FeedbackForm';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TeamMemberSummary {
  id: string;
  name: string;
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
  role?: 'ambassador' | 'leader';
  active?: boolean;
  photoUrl?: string;
}

export default function LeaderDashboard() {
  const [team, setTeam] = useState<TeamMemberSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'activity' | 'compliance'>('activity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchTeam = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(
          `https://ambassador-tracking-backend-production.up.railway.app/analytics/team-compliance`,
          {
            params: {
              leaderId: userId,
              start: startDate || undefined,
              end: endDate || undefined,
            },
          }
        );

        // ✅ Map photoUrl from the backend (fallbacks included)
setTeam(
  res.data.map((member: any) => ({
    ...member,
    photoUrl: member.photoUrl ?? member.photo_url ?? member.profileImage ?? '',
  }))
);


        setLastUpdate(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('❌ Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [userId, startDate, endDate]);

  const filteredTeam = team
    .filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase());
      const isActive = member.active !== false;
      return matchesSearch && isActive;
    })
    .sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      if (sortField === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (sortField === 'activity') {
        aVal = a.actual.stories + a.actual.posts + a.actual.reels;
        bVal = b.actual.stories + b.actual.posts + b.actual.reels;
      } else if (sortField === 'compliance') {
        const aGood = ['story', 'post', 'reel'].filter(
          (k) => a.compliance[k as keyof typeof a.compliance] === 'green'
        ).length;
        const bGood = ['story', 'post', 'reel'].filter(
          (k) => b.compliance[k as keyof typeof b.compliance] === 'green'
        ).length;
        aVal = aGood;
        bVal = bGood;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">My Team's Weekly Summary</h2>
        <div className="flex flex-wrap gap-3 items-center w-full">
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            onClick={() => setLoading(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm w-full sm:w-auto"
          >
            Refresh
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">Last updated: {lastUpdate}</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name"
          className="border px-3 py-1 rounded text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as 'name' | 'activity' | 'compliance')}
          className="border px-3 py-1 rounded text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="activity">Sort by Activity</option>
          <option value="compliance">Sort by Compliance</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="border px-3 py-1 rounded text-sm"
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((member) => (
            <div key={member.id} className="bg-white p-4 rounded-xl shadow-md">
              <div className="flex items-center mb-4 gap-3">
{member.photoUrl && (
  <img
    src={member.photoUrl}
    alt={`${member.name} profile`}
    onClick={() => window.open(member.photoUrl, '_blank')}
    className="w-16 h-16 object-cover rounded-full border shadow cursor-pointer hover:scale-105 transition duration-150"
  />
)}

                <h3 className="font-semibold text-lg">{member.name}</h3>
              </div>

              <div className="flex gap-2 mb-3">
                {(['story', 'post', 'reel'] as const).map((type) => {
                  const compliance = member.compliance[type];
                  const expected = member.expected[
                    type === 'story' ? 'stories' : type === 'post' ? 'posts' : 'reels'
                  ];
                  const color =
                    expected === 0
                      ? 'bg-yellow-500'
                      : compliance === 'green'
                      ? 'bg-green-500'
                      : 'bg-red-500';
                  return (
                    <span
                      key={type}
                      className={`text-xs px-3 py-1 rounded-full text-white font-medium ${color}`}
                    >
                      {type.toUpperCase()} ✓
                    </span>
                  );
                })}
              </div>

              <ResponsiveContainer width="100%" height={150}>
                <BarChart
                  layout="vertical"
                  data={[
                    {
                      type: 'Stories',
                      actual: member.actual.stories,
                      expected: member.expected.stories,
                    },
                    {
                      type: 'Posts',
                      actual: member.actual.posts,
                      expected: member.expected.posts,
                    },
                    {
                      type: 'Reels',
                      actual: member.actual.reels,
                      expected: member.expected.reels,
                    },
                  ]}
                  margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="type" type="category" />
                  <Tooltip />
                  <Bar dataKey="expected" fill="#d1d5db" name="Expected" />
                  <Bar dataKey="actual" fill="#4ade80" name="Actual" />
                </BarChart>
              </ResponsiveContainer>

              <TeamNotes memberId={member.id} memberName={member.name} />
            </div>
          ))}
        </div>
      )}
      <FeedbackForm />
    </Layout>
  );
}
