import axios from './axios';

interface LoginResponse {
  token: string;
  userId: string;
  role: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await axios.post('/auth/login', {
    username,
    password,
  });

  return response.data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
}
