import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
  getUsers,
  createUser,
  toggleUserActive,
  updateUser,
  
} from '../api/users';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  instagram?: string;
  dob?: string;
  phone?: string;
  participationDate?: string;
  note?: string;
  role: 'ambassador' | 'leader';
  active: boolean;
  photoUrl?: string; // ✅ Add this
}


export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
const [teams, setTeams] = useState<{ id: string; name: string; members: string[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'ambassador' | 'leader'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
const [modalImage, setModalImage] = useState<string | null>(null);

  const [newUser, setNewUser] = useState<Omit<User, 'id' | 'active'>>({
    name: '',
    username: '',
    password: '',
    instagram: '',
    dob: '',
    phone: '',
    participationDate: '',
    role: 'ambassador',
    note: '',
  });

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editState, setEditState] = useState<Partial<User>>({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

const fetchTeams = async () => {
const res = await axios.get('https://ambassador-tracking-backend-production.up.railway.app/admin/teams');
  setTeams(
    res.data.map((t: any) => ({
      id: t.id,
      name: t.name,
      members: (t.members || []).map((m: any) => m.id), // user IDs
    }))
  );
};


  const handleCreate = async () => {
    const { name, username, password, instagram, dob, phone, participationDate, role } = newUser;
    if (
      !name.trim() ||
      !username.trim() ||
      !password?.trim() ||
      !instagram?.trim() ||
      !dob?.trim() ||
      !phone?.trim() ||
      !participationDate?.trim() ||
      !role
    ) {
      alert("Please fill in all required fields (note is optional).");
      return;
    }
    try {
      await createUser(newUser);
      setNewUser({
        name: '',
        username: '',
        password: '',
        instagram: '',
        dob: '',
        phone: '',
        participationDate: '',
        role: 'ambassador',
        note: '',
      });
      fetchUsers();
    } catch (err) {
      console.error('Create user failed', err);
    }
  };

  const handleUpdate = async () => {
    if (!editingUserId || !editState.name || !editState.username) return;
    try {
      await updateUser(editingUserId, editState);
      setEditingUserId(null);
      setEditState({});
      fetchUsers();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleUserActive(id);
      fetchUsers();
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.active) ||
      (statusFilter === 'inactive' && !user.active);
const matchesTeam =
  teamFilter === 'all' ||
  teams.find(t => t.id === teamFilter)?.members.includes(user.id);

    return matchesSearch && matchesRole && matchesStatus && matchesTeam;
  });

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search by name or username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-1 rounded"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | 'ambassador' | 'leader')}
          className="border px-3 py-1 rounded"
        >
          <option value="all">All Roles</option>
          <option value="ambassador">Ambassador</option>
          <option value="leader">Leader</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="border px-3 py-1 rounded"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          <option value="all">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Add New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input placeholder="Name" value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="border px-3 py-1 rounded" />
          <input placeholder="Username" value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            className="border px-3 py-1 rounded" />
          <input type="password" placeholder="Password" value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="border px-3 py-1 rounded" />
          <input placeholder="Instagram Account" value={newUser.instagram}
            onChange={(e) => setNewUser({ ...newUser, instagram: e.target.value })}
            className="border px-3 py-1 rounded" />
          <input type="date" value={newUser.dob}
            onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })}
            className="border px-3 py-1 rounded" />
          <input placeholder="Phone" value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            className="border px-3 py-1 rounded" />
          <input type="date" value={newUser.participationDate}
            onChange={(e) => setNewUser({ ...newUser, participationDate: e.target.value })}
            className="border px-3 py-1 rounded" />
          <select value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
            className="border px-3 py-1 rounded">
            <option value="ambassador">Ambassador</option>
            <option value="leader">Leader</option>
          </select>
          <input placeholder="Note" value={newUser.note || ''}
            onChange={(e) => setNewUser({ ...newUser, note: e.target.value })}
            className="border px-3 py-1 rounded" />

           <input
               placeholder="Photo URL"
               value={newUser.photoUrl || ''}
               onChange={(e) => setNewUser({ ...newUser, photoUrl: e.target.value })}
               className="border px-3 py-1 rounded" />

          <button onClick={handleCreate}
            className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700">
            Add
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded shadow-md">
              {editingUserId === user.id ? (
                <>
                  <input value={editState.name || ''} placeholder="Name"
                    onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2" />
                  <input value={editState.username || ''} placeholder="Username"
                    onChange={(e) => setEditState({ ...editState, username: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2" />
                  <input type="password" placeholder="Password"
                    onChange={(e) => setEditState({ ...editState, password: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2" />
                  <input value={editState.instagram || ''} placeholder="Instagram"
                    onChange={(e) => setEditState({ ...editState, instagram: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2" />
                  <input type="date" value={editState.dob || ''}
                    onChange={(e) => setEditState({ ...editState, dob: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2" />
                  <input value={editState.phone || ''} placeholder="Phone"
                    onChange={(e) => setEditState({ ...editState, phone: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2" />
                  <input type="date" value={editState.participationDate || ''}
                    onChange={(e) => setEditState({ ...editState, participationDate: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2" />
                  <select value={editState.role}
                    onChange={(e) => setEditState({ ...editState, role: e.target.value as User['role'] })}
                    className="border px-3 py-1 rounded w-full mb-2">
                    <option value="ambassador">Ambassador</option>
                    <option value="leader">Leader</option>
                  </select>
                  <input value={editState.note || ''} placeholder="Note"
                    onChange={(e) => setEditState({ ...editState, note: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2" />

                  <input
                      placeholder="Photo URL"
                      value={editState.photoUrl || ''}
                      onChange={(e) => setEditState({ ...editState, photoUrl: e.target.value })}
                      className="border px-3 py-1 rounded w-full mb-2"
                    />


                  <div className="flex gap-2">
                    <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-1 rounded">Save</button>
                    <button onClick={() => setEditingUserId(null)} className="bg-gray-400 text-white px-4 py-1 rounded">Cancel</button>
                  </div>
                </>
              ) : (
<div className="flex justify-between items-center gap-6">
                {(() => {
                  const user1 = users.find((u) => u.id === user.id);
                  return (
                    <>
                      {user1?.photoUrl && (
                        <img
                          src={user.photoUrl}
                          alt={`${user.name} profile`}
                          className="ml-[130px] w-32 h-32 object-cover rounded-full cursor-pointer border shadow hover:scale-105 transition"
                          onClick={() => setModalImage(user.photoUrl || '')}
                        />
                      )}
                    </>
                  );
                })()}

              <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">Username: {user.username}</p>
                    <p className="text-sm text-gray-500">Role: {user.role}</p>
                    <p className="text-sm text-gray-500">Instagram: {user.instagram || '-'}</p>
                    <p className="text-sm text-gray-500">DOB: {user.dob || '-'}</p>
                    <p className="text-sm text-gray-500">Phone: {user.phone || '-'}</p>
                    <p className="text-sm text-gray-500">Participation Date: {user.participationDate || '-'}</p>
                    <p className="text-sm text-gray-500">Note: {user.note || '-'}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => {
                      setEditingUserId(user.id);
                      setEditState(user);
                    }}
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Edit</button>
                    <button onClick={() => handleToggle(user.id)}
                      className={`px-4 py-1 rounded text-white ${user.active ? 'bg-red-600' : 'bg-green-600'}`}>
                      {user.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
              {modalImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            onClick={() => setModalImage(null)}
          >
            <div
              className="bg-white p-4 rounded shadow max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={modalImage}
                alt="Full Size"
                className="w-full h-auto object-contain max-h-[80vh] rounded"
              />
              <button
                className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                onClick={() => setModalImage(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
    </Layout>
  );
}
