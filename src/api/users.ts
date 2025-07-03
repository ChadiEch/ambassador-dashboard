import axios from './axios';

export async function getUsers() {
  const res = await axios.get('/admin/users');
  return res.data;
}

export async function createUser(user: {
  name: string;
  username: string;
  password?: string; // allow optional password
  instagram?: string;
  dob?: string;
  role: 'ambassador' | 'leader';
}) {
  const res = await axios.post('/admin/users', user);
  return res.data;
}

// src/types/User.ts (recommended location)
export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  instagram?: string;
  dob?: string;
  role: 'ambassador' | 'leader';
  active: boolean;
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const payload = {
    ...updates,
    // ensure required fields are not undefined if your DB requires them
    username: updates.username ?? '', 
    password: updates.password ?? 'placeholder', // or keep unchanged if not updated
  };

  const res = await axios.patch(`/admin/users/${userId}`, payload);
  return res.data;
}


export async function deleteUser(userId: string) {
  const res = await axios.delete(`/admin/users/${userId}`);
  return res.data;
}

export async function toggleUserActive(userId: string) {
  const res = await axios.patch(`/admin/users/${userId}/toggle`);
  return res.data;
}
