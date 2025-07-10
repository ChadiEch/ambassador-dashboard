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
}

export default function LeaderDashboard() {
  const [team, setTeam] = useState<TeamMemberSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'ambassador' | 'leader'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<'name' | 'activity' | 'compliance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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
      setTeam(res.data);
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
      const memberRole = member.role || 'ambassador';
      const isActive = member.active !== false;

      const matchesRole = roleFilter === 'all' || memberRole === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);

      return matchesSearch && matchesRole && matchesStatus;
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
      <h2 className="text-2xl font-bold mb-6">My Team's Weekly Summary</h2>
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
      onClick={() => setLoading(true)} // Triggers useEffect re-fetch
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | 'ambassador' | 'leader')}
          className="border px-3 py-1 rounded text-sm"
        >
          <option value="all">All Roles</option>
          <option value="ambassador">Ambassador</option>
          <option value="leader">Leader</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="border px-3 py-1 rounded text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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
              <h3 className="font-semibold text-lg mb-2">{member.name}</h3>
              <div className="flex gap-2 mb-3">
                {['story', 'post', 'reel'].map((type) => (
                  <span
                    key={type}
                    className={`text-xs px-3 py-1 rounded-full text-white font-medium ${
                      member.compliance[type as keyof TeamMemberSummary['compliance']] === 'green'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  >
                    {type.toUpperCase()} ✓
                  </span>
                ))}
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
