// src/api/teams.ts
import axios from './axios';

export async function getTeams() {
  const res = await axios.get('/admin/teams');
  return res.data;
}

export async function createTeam(name: string, leaderId: string, memberIds: string[]) {
  const res = await axios.post('/admin/teams', {
    name,
    leaderId,
    memberIds,
  });
  return res.data;
}

export const deleteTeam = async (id: string) => {
  await axios.delete(`http://localhost:5000/admin/teams/${id}`);
};

export const updateTeam = async (teamId: string, payload: { name: string; leaderId: string; memberIds: string[] }) => {
  const res = await axios.patch(`/admin/teams/${teamId}`, payload);
  return res.data;
};
