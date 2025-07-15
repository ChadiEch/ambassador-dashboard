// src/pages/LeaderAnalytics.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function LeaderAnalytics() {
  const [monthlyTeamActivity, setMonthlyTeamActivity] = useState([]);
  const [teamCompliance, setTeamCompliance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const leaderId = localStorage.getItem('userId');

    if (!leaderId) {
      setError('User ID not found in localStorage.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res1 = await axios.get('/analytics/monthly-activity', {
          params: { leaderId },
        });

        const res2 = await axios.get('/analytics/team-compliance-stats', {
          params: { leaderId },
        });

        setMonthlyTeamActivity(res1.data);
        setTeamCompliance(res2.data);
      } catch (err) {
        console.error('Error loading leader analytics:', err);
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Layout><p>Loading analytics...</p></Layout>;
  if (error) return <Layout><p className="text-red-500">{error}</p></Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Team Analytics (Leader View)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Monthly Team Activity */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Team Activity Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTeamActivity}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="stories" stroke="#8884d8" />
              <Line type="monotone" dataKey="posts" stroke="#82ca9d" />
              <Line type="monotone" dataKey="reels" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Team Compliance Over Time */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Team Compliance Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamCompliance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="compliantCount" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
