import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import TeamNotes from '../components/TeamNotes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AmbassadorSummary {
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
  lastActivity?: string; // ✅ Add this

}

interface User {
  id: string;
  name: string;
  role: 'ambassador' | 'leader' | 'admin';
  active: boolean;
  photoUrl?: string;
  link?: string; // ✅ Added this
}


interface Team {
  id: string;
  name: string;
  leaderId: string;
  members: string[];
}

export default function AdminDashboard() {
  const [ambassadors, setAmbassadors] = useState<AmbassadorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'ambassador' | 'leader'>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  const [sortField, setSortField] = useState<'name' | 'activity' | 'compliance'>('activity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        'https://ambassador-tracking-backend-production.up.railway.app/analytics/all-compliance',
        {
          params: {
            start: startDate || undefined,
            end: endDate || undefined,
          },
        }
      );

      const normalized = res.data.map((amb: any) => ({
        ...amb,
        actual: {
          stories: amb.actual.stories ?? amb.actual.story ?? 0,
          posts: amb.actual.posts ?? amb.actual.post ?? 0,
          reels: amb.actual.reels ?? amb.actual.reel ?? 0,
        },
        expected: {
          stories: amb.expected.stories ?? amb.expected.story ?? 0,
          posts: amb.expected.posts ?? amb.expected.post ?? 0,
          reels: amb.expected.reels ?? amb.expected.reel ?? 0,
        },
      }));

      setAmbassadors(normalized);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching ambassador data:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const fetchUsersAndTeams = useCallback(async () => {
    try {
      const [usersRes, teamsRes] = await Promise.all([
        axios.get('https://ambassador-tracking-backend-production.up.railway.app/admin/users'),
        axios.get('https://ambassador-tracking-backend-production.up.railway.app/admin/teams'),
      ]);
      setUsers(usersRes.data);
setTeams(
  teamsRes.data.map((t: any) => ({
    id: t.id,
    name: t.name,
    leaderId: t.leader?.id,
    members: (t.members || []).map((m: any) => m.id),
  }))
);

    } catch (err) {
      console.error('Error loading users or teams', err);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchUsersAndTeams();
    const interval = setInterval(fetchAll, 180000);
    return () => clearInterval(interval);
  }, [fetchAll, fetchUsersAndTeams]);

  const filtered = ambassadors
    .filter((amb) => {
      const user = users.find((u) => u.id === amb.id);
      if (!user || user.role === 'admin' || !user.active) return false;

      const matchesSearch = amb.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesTeam =
        teamFilter === 'all' ||
        teams.find((t) => t.id === teamFilter)?.members.includes(amb.id);

      return matchesSearch && matchesRole && matchesTeam;
    })
    .sort((a, b) => {
      let aVal: number | string = '';
      let bVal: number | string = '';

      if (sortField === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (sortField === 'activity') {
        aVal = new Date(a.lastActivity || 0).getTime();
        bVal = new Date(b.lastActivity || 0).getTime();
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Ambassador Weekly Overview</h2>
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
            onClick={fetchAll}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm w-full sm:w-auto"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
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
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="border px-3 py-1 rounded text-sm"
        >
          <option value="all">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
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

      <p className="text-sm text-gray-500 mb-4">Last updated: {lastUpdate}</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((amb) => {
            const user = users.find((u) => u.id === amb.id);
const team = teams.find(
  (t) =>
    t.members.includes(amb.id) || // if ambassador
    t.leaderId === amb.id          // if leader
);
 
            return (
<div key={amb.id} className="bg-white p-4 rounded-xl shadow-md">
  <div className="flex items-center mb-4 gap-3">
  {user?.photoUrl && (
    <img
      src={user.photoUrl}
      alt={`${amb.name} profile`}
      onClick={() => window.open(user.photoUrl, '_blank')}
      className="w-16 h-16 object-cover rounded-full border shadow cursor-pointer hover:scale-105 transition duration-150"
    />
  )}
  <div>
    <h3 className="font-semibold text-lg">{amb.name}</h3>
    <p className="text-[10px] text-gray-500">
      Team: {team ? team.name : 'Unassigned'}
    </p>
      {user?.link && (
    <a
      href={user.link.startsWith('http') ? user.link : `https://${user.link}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] text-blue-600 underline"
    >
      {user.link}
    </a>
  )}
    {amb.lastActivity && (
  <p className="text-[10px] text-gray-500">
    Last Active: {new Date(amb.lastActivity).toLocaleString()}
  </p>
)}

  </div>
</div>

  <div className="flex gap-2 mb-4">
    {(['story', 'post', 'reel'] as const).map((type) => {
      const expected =
        type === 'story'
          ? amb.expected.stories
          : type === 'post'
          ? amb.expected.posts
          : amb.expected.reels;

      const isGreen = amb.compliance[type] === 'green';
      const isZeroRule = expected === 0;

      const bgColor = isZeroRule
        ? 'bg-yellow-500'
        : isGreen
        ? 'bg-green-500'
        : 'bg-red-500';

      return (
        <span
          key={type}
          className={`text-xs px-3 py-1 rounded-full text-white font-medium ${bgColor}`}
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
          actual: amb.actual.stories,
          expected: amb.expected.stories,
        },
        {
          type: 'Posts',
          actual: amb.actual.posts,
          expected: amb.expected.posts,
        },
        {
          type: 'Reels',
          actual: amb.actual.reels,
          expected: amb.expected.reels,
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

  <TeamNotes memberId={amb.id} memberName={amb.name} />
</div>

            );
          })}
        </div>
      )}
    </Layout>
  );
}
