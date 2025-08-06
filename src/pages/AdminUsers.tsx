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
  photoUrl?: string;
  link?: string;
  warningsCount?: number;         // ✅ new field from backend
  warningEscalated?: boolean;     // ✅ indicates 3 warnings reached
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
  const [feedbackModalUserId, setFeedbackModalUserId] = useState<string | null>(null);
  const [deactivationFeedback, setDeactivationFeedback] = useState({
    reason: '',
    rating: '',
    note: '',
  });

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
    photoUrl: '',
    link: '',
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
    try {
      const res = await axios.get(
        'https://ambassador-tracking-backend-production.up.railway.app/admin/teams'
      );
      setTeams(
        res.data.map((t: any) => ({
          id: t.id,
          name: t.name,
          members: (t.members || []).map((m: any) => m.id),
        }))
      );
    } catch (err) {
      console.error('Failed to load teams', err);
    }
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
      alert('Please fill in all required fields (note is optional).');
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
        photoUrl: '',
        link: '',
      });
      fetchUsers();
    } catch (err) {
      console.error('Create user failed', err);
    }
  };

  const handleUpdate = async () => {
    if (!editingUserId || !editState.name || !editState.username) return;

    try {
      // Exclude any complex nested properties before update
      const { warnings, activities, ambassadorActivities, ...safeData } = editState as any;
      await updateUser(editingUserId, safeData);
      setEditingUserId(null);
      setEditState({});
      fetchUsers();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  // This function toggles user active status directly (activation or deactivation without feedback)
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
      teamFilter === 'all' || teams.find((t) => t.id === teamFilter)?.members.includes(user.id);

    return matchesSearch && matchesRole && matchesStatus && matchesTeam;
  });

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      {/* Filters */}
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
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add New User */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Add New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <input
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <input
            placeholder="Instagram Account"
            value={newUser.instagram}
            onChange={(e) => setNewUser({ ...newUser, instagram: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <input
            type="date"
            value={newUser.dob}
            onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <input
            placeholder="Phone"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <input
            type="date"
            value={newUser.participationDate}
            onChange={(e) => setNewUser({ ...newUser, participationDate: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
            className="border px-3 py-1 rounded"
          >
            <option value="ambassador">Ambassador</option>
            <option value="leader">Leader</option>
          </select>
          <input
            placeholder="Note"
            value={newUser.note || ''}
            onChange={(e) => setNewUser({ ...newUser, note: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <input
            placeholder="Photo URL"
            value={newUser.photoUrl || ''}
            onChange={(e) => setNewUser({ ...newUser, photoUrl: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <input
            placeholder="Link"
            value={newUser.link || ''}
            onChange={(e) => setNewUser({ ...newUser, link: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <button
            onClick={handleCreate}
            className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded shadow-md">
              {editingUserId === user.id ? (
                <>
                  {/* Editing Form */}
                  <input
                    value={editState.name || ''}
                    placeholder="Name"
                    onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2"
                  />
                  <input
                    value={editState.username || ''}
                    placeholder="Username"
                    onChange={(e) => setEditState({ ...editState, username: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setEditState({ ...editState, password: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2"
                  />
                  <input
                    value={editState.instagram || ''}
                    placeholder="Instagram"
                    onChange={(e) => setEditState({ ...editState, instagram: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2"
                  />
                  <input
                    type="date"
                    value={editState.dob || ''}
                    onChange={(e) => setEditState({ ...editState, dob: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2"
                  />
                  <input
                    value={editState.phone || ''}
                    placeholder="Phone"
                    onChange={(e) => setEditState({ ...editState, phone: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2"
                  />
                  <input
                    type="date"
                    value={editState.participationDate || ''}
                    onChange={(e) => setEditState({ ...editState, participationDate: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2"
                  />
                  <select
                    value={editState.role}
                    onChange={(e) => setEditState({ ...editState, role: e.target.value as User['role'] })}
                    className="border px-3 py-1 rounded w-full mb-2"
                  >
                    <option value="ambassador">Ambassador</option>
                    <option value="leader">Leader</option>
                  </select>
                  <input
                    value={editState.note || ''}
                    placeholder="Note"
                    onChange={(e) => setEditState({ ...editState, note: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2"
                  />
                  <input
                    placeholder="Photo URL"
                    value={editState.photoUrl || ''}
                    onChange={(e) => setEditState({ ...editState, photoUrl: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2"
                  />
                  <input
                    placeholder="Link"
                    value={editState.link || ''}
                    onChange={(e) => setEditState({ ...editState, link: e.target.value })}
                    className="border px-3 py-1 rounded w-full mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="bg-green-600 text-white px-4 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingUserId(null)}
                      className="bg-gray-400 text-white px-4 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center gap-6">
                  {/* Profile Image */}
                  {user.photoUrl && (
                    <img
                      src={user.photoUrl}
                      alt={`${user.name} profile`}
                      className="ml-[17.5%] w-32 h-33 object-cover cursor-pointer border shadow hover:scale-105 transition"
                      onClick={() => setModalImage(user.photoUrl || '')}
                    />
                  )}

                  {/* User Details */}
                  <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">Username: {user.username}</p>
                    <p className="text-sm text-gray-500">Role: {user.role}</p>
                    <p className="text-sm text-gray-500">Instagram: {user.instagram || '-'}</p>
                    <p className="text-sm text-gray-500">DOB: {user.dob || '-'}</p>
                    <p className="text-sm text-gray-500">Phone: {user.phone || '-'}</p>
                    <p className="text-sm text-gray-500">
                      Participation Date: {user.participationDate || '-'}
                    </p>
                    <p className="text-sm text-gray-500">Note: {user.note || '-'}</p>
                    <p className="text-sm text-gray-500">
                      Warnings: <b>{user.warningsCount || 0}</b>
                      {user.warningEscalated && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                          3 warnings - Review Required
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setEditingUserId(user.id);
                        setEditState(user);
                      }}
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>

                    {/* Clear warnings */}
                    <button
                      onClick={async () => {
                        await axios.patch(`/warnings/${user.id}/clear`);
                        fetchUsers();
                      }}
                      className="bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-700"
                    >
                      Clear Warnings
                    </button>

                    {/* Pause warnings */}
                    <button
                      onClick={async () => {
                        const until = prompt('Pause warnings until (YYYY-MM-DD)?');
                        if (until) {
                          await axios.patch(`/warnings/${user.id}/pause`, { until });
                          fetchUsers();
                        }
                      }}
                      className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700"
                    >
                      Pause Warnings
                    </button>

                    {/* Deactivate / Activate button with modal if escalated */}
                    <button
                      onClick={async () => {
                        if (user.active ) {
                          // Open modal for feedback on deactivation
                          alert('Please provide feedback before deactivating');
                          setFeedbackModalUserId(user.id);
                        } else {
                          // Toggle active status directly
                          await handleToggle(user.id);
                        }
                      }}
                      className={`px-4 py-1 rounded text-white ${
                        user.active ? 'bg-red-600' : 'bg-green-600'
                      }`}
                    >
                      {user.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
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

      {/* Deactivation Feedback Modal */}
      {feedbackModalUserId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setFeedbackModalUserId(null)}
        >
          <div
            className="bg-white p-6 rounded shadow max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Deactivation Feedback</h3>

            <label className="block mb-2 text-sm font-medium">Reason for Leaving *</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded mb-4"
              value={deactivationFeedback.reason}
              onChange={(e) =>
                setDeactivationFeedback({ ...deactivationFeedback, reason: e.target.value })
              }
              placeholder="e.g. Not interested anymore"
            />

            <label className="block mb-2 text-sm font-medium">Rating (out of 10) *</label>
            <input
              type="number"
              max={10}
              min={0}
              className="w-full border px-3 py-2 rounded mb-4"
              value={deactivationFeedback.rating}
              onChange={(e) =>
                setDeactivationFeedback({ ...deactivationFeedback, rating: e.target.value })
              }
              placeholder="e.g. 7"
            />

            <label className="block mb-2 text-sm font-medium">Optional Note</label>
            <textarea
              className="w-full border px-3 py-2 rounded mb-4"
              rows={3}
              value={deactivationFeedback.note}
              onChange={(e) =>
                setDeactivationFeedback({ ...deactivationFeedback, note: e.target.value })
              }
              placeholder="Any additional context..."
            />

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setFeedbackModalUserId(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={async () => {
                  const { reason, rating } = deactivationFeedback;
                  if (!reason.trim() || !rating.trim()) {
                    alert('Please provide both reason and rating');
                    return;
                  }

                  try {
                    await axios.post(
                      `/admin/users/${feedbackModalUserId}/deactivate-with-feedback`,
                      {
                        reason: deactivationFeedback.reason,
                        rating: Number(deactivationFeedback.rating),
                        note: deactivationFeedback.note,
                        date: new Date().toISOString(),
                      }
                    );
                    setFeedbackModalUserId(null);
                    setDeactivationFeedback({ reason: '', rating: '', note: '' });
                    fetchUsers();
                  } catch (err) {
                    console.error('Failed to deactivate with feedback', err);
                    alert('Something went wrong. Please try again.');
                  }
                }}
              >
                Submit & Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
