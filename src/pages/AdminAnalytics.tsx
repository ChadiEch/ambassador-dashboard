// src/pages/AdminAnalytics.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid, BarChart, Bar, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9457EB'];

export default function AdminAnalytics() {
  const [monthlyActivity, setMonthlyActivity] = useState([]);
  const [teamActivity, setTeamActivity] = useState([]);
  const [teamContribution, setTeamContribution] = useState([]);
  const [overallCompliance, setOverallCompliance] = useState([]);
  const [teamCompliance, setTeamCompliance] = useState([]);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res1 = await axios.get('https://ambassador-tracking-backend-production.up.railway.app/analytics/monthly-activity');
      const res2 = await axios.get('https://ambassador-tracking-backend-production.up.railway.app/analytics/team-monthly-activity');
      const res3 = await axios.get('https://ambassador-tracking-backend-production.up.railway.app/analytics/team-contribution');
      const res4 = await axios.get('https://ambassador-tracking-backend-production.up.railway.app/analytics/all-compliance');
      const res5 = await axios.get('https://ambassador-tracking-backend-production.up.railway.app/analytics/team-compliance');

      setMonthlyActivity(res1.data);
      setTeamActivity(res2.data);
      setTeamContribution(res3.data);
      setOverallCompliance(res4.data);
      setTeamCompliance(res5.data);
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
    }
  };

  fetchData();
}, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Admin Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Monthly Ambassador Activity */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Monthly Ambassador Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyActivity}>
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

        {/* 2. Team Activity */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Team Activity Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="teamName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stories" fill="#8884d8" />
              <Bar dataKey="posts" fill="#82ca9d" />
              <Bar dataKey="reels" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Team Contribution Pie */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Team Contribution %</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={teamContribution}
                dataKey="percentage"
                nameKey="team"
                outerRadius={100}
                label
              >
                {teamContribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Overall Compliance */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Overall Compliance Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overallCompliance}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="compliantAmbassadors" stroke="#00C49F" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 5. Compliance by Team */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Compliance by Team</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamCompliance}>
              <XAxis dataKey="teamName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="compliantCount" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
