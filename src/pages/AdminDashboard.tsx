import { useEffect, useState, useCallback, useMemo } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [checkingTags, setCheckingTags] = useState(false);
  const [tagCheckResult, setTagCheckResult] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'ambassador' | 'leader'>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  const [sortField, setSortField] = useState<'name' | 'activity' | 'compliance' | 'activities' | 'lastUpload'>('activity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      setError('Failed to load ambassador data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const manuallyCheckTags = useCallback(async () => {
    setCheckingTags(true);
    setTagCheckResult(null);
    try {
      const response = await axios.get(
        'https://ambassador-tracking-backend-production.up.railway.app/webhook/check-tags'
      );
      
      if (response.data.success) {
        setTagCheckResult(`Success: ${response.data.data.message}`);
        // Refresh the dashboard data to show any new tagged media
        fetchAll();
      } else {
        setTagCheckResult('Failed to check tags');
      }
    } catch (err) {
      console.error('Error checking tags:', err);
      setTagCheckResult('Error checking tags. Please try again.');
    } finally {
      setCheckingTags(false);
    }
  }, [fetchAll]);

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
      setError('Failed to load users and teams. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchUsersAndTeams();
    const interval = setInterval(fetchAll, 180000);
    return () => clearInterval(interval);
  }, [fetchAll, fetchUsersAndTeams]);

  // Memoize filtered and sorted data
  const filteredAmbassadors = useMemo(() => {
    return ambassadors
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
        } else if (sortField === 'activity' || sortField === 'lastUpload') {
          // For activity/last upload sorting, we want the most recent activity first when descending
          const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
          const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
          aVal = aTime;
          bVal = bTime;
        } else if (sortField === 'compliance') {
          // For compliance sorting, count how many requirements are met
          const aComplianceCount = Object.values(a.compliance).filter(status => status === 'green').length;
          const bComplianceCount = Object.values(b.compliance).filter(status => status === 'green').length;
          aVal = aComplianceCount;
          bVal = bComplianceCount;
        } else if (sortField === 'activities') {
          // For activities sorting, sum all activities
          const aTotalActivities = a.actual.stories + a.actual.posts + a.actual.reels;
          const bTotalActivities = b.actual.stories + b.actual.posts + b.actual.reels;
          aVal = aTotalActivities;
          bVal = bTotalActivities;
        }

        // Handle the sorting order
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [ambassadors, users, teams, search, roleFilter, teamFilter, sortField, sortOrder]);

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
          <button
            onClick={manuallyCheckTags}
            disabled={checkingTags}
            className={`px-4 py-1 rounded text-sm w-full sm:w-auto ${
              checkingTags 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {checkingTags ? 'Checking...' : 'Check Instagram Tags'}
          </button>
        </div>
      </div>

      {tagCheckResult && (
        <div className={`mb-4 p-3 rounded ${tagCheckResult.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {tagCheckResult}
        </div>
      )}

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
          onChange={(e) => setSortField(e.target.value as 'name' | 'activity' | 'compliance' | 'activities' | 'lastUpload')}
          className="border px-3 py-1 rounded text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="activities">Sort by Activities</option>
          <option value="compliance">Sort by Compliance</option>
          <option value="lastUpload">Sort by Last Upload</option>
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
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAmbassadors.map((amb) => {
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