import React, { useEffect, useState } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const AdminAnalytics = () => {
  const [complianceCount, setComplianceCount] = useState<number>(0);
  const [teamContribution, setTeamContribution] = useState<any[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<Record<string, Record<string, number>>>({});
  const [weeklyCompliance, setWeeklyCompliance] = useState<any[]>([]);
  const [complianceTrend, setComplianceTrend] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          complianceRes,
          teamPieRes,
          monthlyRes,
          weeklyRes,
          trendRes
        ] = await Promise.all([
          fetch('/api/analytics/overall-compliance'),
          fetch('/api/analytics/team-contribution'),
          fetch('/api/analytics/monthly-activity'),
          fetch('/api/analytics/team-monthly-activity'),
          fetch('/api/analytics/weekly-compliance'),
          fetch('/api/analytics/compliance-trend'),
        ]);

        setComplianceCount(await complianceRes.json());
        setTeamContribution(await teamPieRes.json());
        setMonthlyActivity(await monthlyRes.json());
        setWeeklyCompliance(await weeklyRes.json());
        setComplianceTrend(await trendRes.json());
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };

    fetchData();
  }, []);

  // Helpers for Charts
  const pieData = {
    labels: teamContribution.map((item) => `Team ${item.teamId}`),
    datasets: [{
      data: teamContribution.map(item => (item.STORY || 0) + (item.IMAGE || 0) + (item.VIDEO || 0)),
      backgroundColor: ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'],
    }]
  };

  const monthlyLabels = Object.keys(monthlyActivity);
  const barData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Stories',
        backgroundColor: '#60a5fa',
        data: monthlyLabels.map(month => monthlyActivity[month]?.STORY || 0)
      },
      {
        label: 'Posts',
        backgroundColor: '#34d399',
        data: monthlyLabels.map(month => monthlyActivity[month]?.IMAGE || 0)
      },
      {
        label: 'Reels',
        backgroundColor: '#fbbf24',
        data: monthlyLabels.map(month => monthlyActivity[month]?.VIDEO || 0)
      },
    ]
  };

  const lineLabels = complianceTrend.map(c => c.month);
  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Compliant Ambassadors',
        data: complianceTrend.map(c => c.compliant),
        fill: false,
        borderColor: '#10b981',
        tension: 0.4
      }
    ]
  };

  return (
    <div className="p-8 space-y-12">
      <h1 className="text-3xl font-bold mb-4">📊 Admin Analytics Dashboard</h1>

      {/* 1. Compliance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-100 text-green-700 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Compliant Ambassadors</h2>
          <p className="text-4xl mt-2">{complianceCount}</p>
        </div>
      </div>

      {/* 2. Team Contribution Pie */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Team Contribution</h2>
        <div className="max-w-md">
          <Pie data={pieData} />
        </div>
      </div>

      {/* 3. Global Monthly Activity */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Monthly Activity (Global)</h2>
        <Bar data={barData} />
      </div>

      {/* 4. Weekly Compliance Table */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Ambassador Weekly Compliance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2">Stories</th>
                <th className="px-4 py-2">Posts</th>
                <th className="px-4 py-2">Reels</th>
                <th className="px-4 py-2">Compliance</th>
              </tr>
            </thead>
            <tbody>
              {weeklyCompliance.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.actual.stories}</td>
                  <td className="px-4 py-2">{u.actual.posts}</td>
                  <td className="px-4 py-2">{u.actual.reels}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-white text-xs ${u.compliance.story === 'green' && u.compliance.post === 'green' && u.compliance.reel === 'green' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {u.compliance.story === 'green' && u.compliance.post === 'green' && u.compliance.reel === 'green' ? 'Compliant' : 'Non-compliant'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Compliance Trend Line Chart */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Compliance Trend Over Time</h2>
        <Line data={lineData} />
      </div>
    </div>
  );
};

export default AdminAnalytics;
