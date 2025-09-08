import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import analyticsAPI, {
  TeamPerformance,
  UserEngagement,
  ActivityTrend
} from '../api/analytics';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';

interface TeamKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

const TeamKPICard: React.FC<TeamKPICardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  color = '#3B82F6' 
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '➖';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {trend && trendValue && (
          <div className={`text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()} {trendValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default function LeaderAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance | null>(null);
  const [teamMembers, setTeamMembers] = useState<UserEngagement[]>([]);
  const [activityTrends, setActivityTrends] = useState<ActivityTrend[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<any[]>([]);
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState(30);

  const leaderId = localStorage.getItem('userId');

  const fetchTeamAnalytics = useCallback(async () => {
    if (!leaderId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch team-specific data
      const [
        allTeamPerformance,
        allUserEngagement,
        trends,
        monthly,
        stats
      ] = await Promise.all([
        analyticsAPI.getTeamPerformance(),
        analyticsAPI.getUserEngagement(),
        analyticsAPI.getActivityTrends(timeRange),
        analyticsAPI.getMonthlyActivity(leaderId),
        analyticsAPI.getTeamComplianceStats(leaderId)
      ]);

      // Find current leader's team
      const currentTeam = allTeamPerformance.find(team => 
        team.teamId === leaderId || team.teamName.includes('Team')
      );

      // Filter team members
      const currentTeamMembers = allUserEngagement.filter(user => 
        user.teamName === currentTeam?.teamName
      );

      setTeamPerformance(currentTeam || null);
      setTeamMembers(currentTeamMembers);
      setActivityTrends(trends);
      setMonthlyActivity(monthly);
      setTeamStats(stats);
    } catch (err) {
      console.error('Error fetching team analytics:', err);
      setError('Failed to load team analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [leaderId, timeRange]);

  useEffect(() => {
    if (!leaderId) {
      setError('Leader ID not found. Please log in again.');
      setLoading(false);
      return;
    }
    fetchTeamAnalytics();
  }, [leaderId, timeRange, fetchTeamAnalytics]);

  const getComplianceColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const calculateTeamStats = () => {
    if (teamMembers.length === 0) {
      return {
        avgComplianceScore: 0,
        totalActivity: 0,
        activeMembers: 0,
        atRiskMembers: 0
      };
    }

    const avgComplianceScore = teamMembers.reduce((sum, member) => 
      sum + member.complianceScore, 0) / teamMembers.length;
    
    const totalActivity = teamMembers.reduce((sum, member) => 
      sum + member.totalActivity, 0);
    
    const activeMembers = teamMembers.filter(member => 
      member.isActive && member.complianceScore >= 60).length;
    
    const atRiskMembers = teamMembers.filter(member => 
      member.complianceScore < 60 || member.warningCount > 0).length;

    return {
      avgComplianceScore,
      totalActivity,
      activeMembers,
      atRiskMembers
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={fetchTeamAnalytics}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const stats = calculateTeamStats();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Analytics</h1>
            {teamPerformance && (
              <p className="text-gray-600">Team: {teamPerformance.teamName}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button 
              onClick={fetchTeamAnalytics}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Team KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TeamKPICard
            title="Team Members"
            value={teamMembers.length}
            subtitle={`${stats.activeMembers} performing well`}
            color="#3B82F6"
          />
          <TeamKPICard
            title="Avg Compliance"
            value={`${stats.avgComplianceScore.toFixed(1)}%`}
            color={getComplianceColor(stats.avgComplianceScore)}
          />
          <TeamKPICard
            title="Total Activity"
            value={stats.totalActivity}
            subtitle="This week"
            color="#10B981"
          />
          <TeamKPICard
            title="At Risk Members"
            value={stats.atRiskMembers}
            subtitle="Need attention"
            color={stats.atRiskMembers > 0 ? '#EF4444' : '#10B981'}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Activity Trends */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Team Activity Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="stories" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="posts" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="reels" 
                  stackId="1" 
                  stroke="#F59E0B" 
                  fill="#F59E0B" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Monthly Team Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stories" fill="#3B82F6" name="Stories" />
                <Bar dataKey="posts" fill="#10B981" name="Posts" />
                <Bar dataKey="reels" fill="#F59E0B" name="Reels" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Member Compliance Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Member Compliance Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { 
                      name: 'Excellent (80%+)', 
                      value: teamMembers.filter(m => m.complianceScore >= 80).length,
                      fill: '#10B981'
                    },
                    { 
                      name: 'Good (60-79%)', 
                      value: teamMembers.filter(m => m.complianceScore >= 60 && m.complianceScore < 80).length,
                      fill: '#F59E0B'
                    },
                    { 
                      name: 'Needs Improvement (<60%)', 
                      value: teamMembers.filter(m => m.complianceScore < 60).length,
                      fill: '#EF4444'
                    }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => (value && value > 0) ? `${name}: ${value}` : ''}
                >
                  {teamMembers.map((_, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Compliance Trend */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Team Compliance Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={teamStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="compliant" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  name="Compliant Members"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Members Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Team Members Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reels</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warnings</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.userId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.userName}</div>
                      {member.lastActivity && (
                        <div className="text-xs text-gray-500">
                          Last active: {format(new Date(member.lastActivity), 'MMM dd')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        member.complianceScore >= 80 ? 'bg-green-100 text-green-800' :
                        member.complianceScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {member.complianceScore.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.stories}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.posts}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.reels}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.warningCount === 0 ? 'bg-green-100 text-green-800' :
                        member.warningCount <= 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {member.warningCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
