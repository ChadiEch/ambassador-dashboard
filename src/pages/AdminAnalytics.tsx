import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import analyticsAPI, {
  DashboardStats,
  ActivityTrend,
  TeamPerformance,
  ComplianceTrend,
  ActivityDistribution,
  TopPerformers,
  InactiveUsers
} from '../api/analytics';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, trend, trendValue, color = 'blue' }) => {
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

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [activityTrends, setActivityTrends] = useState<ActivityTrend[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [complianceTrends, setComplianceTrends] = useState<ComplianceTrend[]>([]);
  const [activityDistribution, setActivityDistribution] = useState<ActivityDistribution[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformers[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<InactiveUsers[]>([]);
  const [timeRange, setTimeRange] = useState(30);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsData,
        trendsData,
        performanceData,
        complianceData,
        distributionData,
        performersData,
        inactiveData
      ] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getActivityTrends(timeRange),
        analyticsAPI.getTeamPerformance(),
        analyticsAPI.getComplianceTrends(6),
        analyticsAPI.getActivityDistribution(),
        analyticsAPI.getTopPerformers(5),
        analyticsAPI.getInactiveUsers(7)
      ]);

      setDashboardStats(statsData);
      setActivityTrends(Array.isArray(trendsData) ? trendsData : []);
      setTeamPerformance(Array.isArray(performanceData) ? performanceData : []);
      setComplianceTrends(Array.isArray(complianceData) ? complianceData : []);
      setActivityDistribution(Array.isArray(distributionData) ? distributionData : []);
      setTopPerformers(Array.isArray(performersData) ? performersData : []);
      setInactiveUsers(Array.isArray(inactiveData) ? inactiveData : []);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAllData();
  }, [timeRange, fetchAllData]);

  const calculateActivityGrowth = () => {
    if (!dashboardStats || dashboardStats.lastWeekActivity === null || dashboardStats.thisWeekActivity === null) {
      return { trend: 'neutral' as const, value: '0.0%' };
    }
    const growth = dashboardStats.lastWeekActivity > 0 ? 
      ((dashboardStats.thisWeekActivity - dashboardStats.lastWeekActivity) / dashboardStats.lastWeekActivity) * 100 : 0;
    return {
      trend: growth > 0 ? 'up' as const : growth < 0 ? 'down' as const : 'neutral' as const,
      value: `${Math.abs(growth).toFixed(1)}%`
    };
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return (typeof num === 'number' ? num : 0).toFixed(1) + '%';
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return '#10B981'; // Green
    if (rate >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
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
            onClick={fetchAllData}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const activityGrowth = calculateActivityGrowth();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
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
              onClick={fetchAllData}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Ambassadors"
              value={formatNumber(dashboardStats.totalAmbassadors)}
              subtitle={`${dashboardStats.activeAmbassadors} active`}
              color="#3B82F6"
            />
            <KPICard
              title="Compliance Rate"
              value={formatPercentage(dashboardStats.overallComplianceRate || 0)}
              color={getComplianceColor(dashboardStats.overallComplianceRate || 0)}
            />
            <KPICard
              title="This Week Activity"
              value={formatNumber(dashboardStats.thisWeekActivity)}
              trend={activityGrowth.trend}
              trendValue={activityGrowth.value}
              color="#10B981"
            />
            <KPICard
              title="Active Warnings"
              value={dashboardStats.activeWarnings}
              subtitle={`${dashboardStats.totalTeams} teams`}
              color="#EF4444"
            />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Trends */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Activity Trends</h2>
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

          {/* Compliance Trends */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Compliance Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={complianceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Compliance Rate']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="complianceRate" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Team Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Team Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamPerformance && teamPerformance.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="teamName" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="complianceRate" fill="#3B82F6" name="Compliance %" />
                <Bar dataKey="avgActivityPerMember" fill="#10B981" name="Avg Activity" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Content Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="mediaType"
                  label={({ mediaType, percentage }) => `${mediaType}: ${(typeof percentage === 'number' ? percentage : 0).toFixed(1)}%`}
                >
                  {activityDistribution && activityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
            <div className="overflow-x-auto">
              {topPerformers && topPerformers.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topPerformers.map((performer, index) => (
                      <tr key={performer.userId}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                              }`}>
                                {index + 1}
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{performer.userName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{performer.teamName || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            performer.complianceScore >= 80 ? 'bg-green-100 text-green-800' :
                            performer.complianceScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {formatPercentage(performer.complianceScore || 0)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(performer.totalActivity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Top Performers Data</h3>
                    <p className="mt-1 text-sm text-gray-500">No ambassador activity data available yet. Check back after ambassadors start posting content.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inactive Users */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Attention Needed</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inactive Days</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warnings</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inactiveUsers && inactiveUsers.slice(0, 5).map((user) => (
                    <tr key={user.userId}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{user.teamName || 'N/A'}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.daysSinceLastActivity >= 14 ? 'bg-red-100 text-red-800' :
                          user.daysSinceLastActivity >= 7 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.daysSinceLastActivity} days
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.warningCount >= 2 ? 'bg-red-100 text-red-800' :
                          user.warningCount >= 1 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.warningCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
