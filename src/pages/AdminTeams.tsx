import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { createTeam, updateTeam } from '../api/teams';
import { getUsers } from '../api/users';
import axios from 'axios';
import { useMemo } from 'react';

interface Team {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  members:  User[];
}

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
}


export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [teamName, setTeamName] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editState, setEditState] = useState<Partial<Team>>({});

  const [search, setSearch] = useState('');





  const fetchTeams = async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/teams');
      const transformed = res.data.map((team: any) => ({
  id: team.id,
  name: team.name,
  leaderId: team.leader?.id,
  leaderName: team.leader?.name || 'Unknown',

members: (team.members || []).map((m: any) => ({
  id: m.id, // ✅ this is userId from backend
  name: m.name,
  username: m.username,
  role: m.role,
  active: m.active,
}))



}));

      setTeams(transformed);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load teams', err);
      setLoading(false);
    }
  };
const assignedAmbassadorIds = useMemo(() => {
  const ids = new Set<string>();
  teams.forEach((team) => {
    team.members.forEach((member) => {
      if (member.id) ids.add(member.id); // member.id is now the ambassador's ID
    });
  });
  return ids;
}, [teams]);


const fetchUsers = useCallback(async () => {
  try {
    const data: User[] = await getUsers();

    const activeUsers = data.filter((u) => u.active && (u.role === 'ambassador' || u.role === 'leader'));
    
    setUsers(activeUsers); // ✅ Now contains both leaders and ambassadors
  } catch (err) {
    console.error('Failed to load users', err);
  } finally {
    setLoading(false);
  }
}, []);




  const handleCreate = async () => {
    if (!teamName || !leaderId || memberIds.length === 0) return;

    try {
      await createTeam(teamName, leaderId, memberIds);
      setTeamName('');
      setLeaderId('');
      setMemberIds([]);
      fetchTeams();
    } catch (err: any) {
      console.error('Failed to create team', err);
      alert(err?.response?.data?.message || 'Team creation failed.');
    }
  };

  const handleDelete = async (teamId: string) => {
    try {
      await axios.delete(`http://localhost:5000/admin/teams/${teamId}`);
      fetchTeams();
    } catch (err) {
      console.error('Failed to delete team', err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!editState.id || !editState.name || !editState.leaderId) return;

      await updateTeam(editState.id, {
        name: editState.name,
        leaderId: editState.leaderId,
        memberIds: editState.members?.map((m) => m.id) || [],
      });

      setEditingTeamId(null);
      setEditState({});
      fetchTeams();
    } catch (err: any) {
      console.error('Failed to update team', err);
      alert(err?.response?.data?.message || 'Team update failed.');
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, [ fetchUsers]);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.leaderName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Team Management</h2>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by team or leader name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/2"
        />
      </div>

      {/* CREATE TEAM FORM */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Add New Team</h3>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="border px-3 py-1 rounded w-full md:w-1/2"
          />
          <select
            value={leaderId}
            onChange={(e) => setLeaderId(e.target.value)}
            className="border px-3 py-1 rounded w-full md:w-1/2"
          >
            <option value="">Select Leader</option>
            {users.filter((u) => u.role === 'leader').map((leader) => (
              <option key={leader.id} value={leader.id}>
                {leader.name}
              </option>
            ))}
          </select>

          <div>
            <h4 className="font-semibold mb-1">Add Members</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {users
                .filter((u) => {
                  if (u.role !== 'ambassador') return false;
                  const isAssignedElsewhere = assignedAmbassadorIds.has(u.id);
                  return !isAssignedElsewhere;
                })
                .map((user) => (
                  <label key={user.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={memberIds.includes(user.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setMemberIds((prev) =>
                          checked ? [...prev, user.id] : prev.filter((id) => id !== user.id)
                        );
                      }}
                    />
                    {user.name}
                  </label>
                ))}
            </div>

          </div>
      

          <button
            onClick={handleCreate}
            className="mt-2 w-full md:w-auto bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
          >
            Create Team
          </button>
        </div>
      </div>

      {/* TEAM LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {filteredTeams.map((team) => {
            const isEditing = editingTeamId === team.id;
            const currentMembers = isEditing ? editState.members || [] : team.members;

            return (
              <div key={team.id} className="bg-white p-4 rounded shadow-md">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editState.name}
                      onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                      className="border px-3 py-1 rounded w-full mb-2"
                    />
                    <select
                      value={editState.leaderId}
                      onChange={(e) => setEditState((s) => ({ ...s, leaderId: e.target.value }))}
                      className="border px-3 py-1 rounded w-full mb-2"
                    >
                      <option value="">Select Leader</option>
                      {users.filter((u) => u.role === 'leader').map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                      {users
                        .filter((u) => {
                          if (u.role !== 'ambassador') return false;
                          const isInThisTeam = currentMembers.some((m) => m.id === u.id);
                          const isAssignedElsewhere = assignedAmbassadorIds.has(u.id) && !isInThisTeam;
                          return !isAssignedElsewhere;
                        })
                        .map((u) => (
                          <label key={u.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={currentMembers.some((m) => m.id === u.id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setEditState((s) => ({
                                  ...s,
                                  members: checked
                                    ? [...(s.members || []), u]
                                    : (s.members || []).filter((m) => m.id !== u.id),
                                }));
                              }}
                            />
                            {u.name}
                          </label>
                        ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingTeamId(null)}
                        className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-1">{team.name}</h3>
                    <p className="text-sm text-gray-600">Leader: {team.leaderName}</p>
                    <p className="text-sm text-gray-600">
                      Members:{' '}
                      {team.members.length > 0
                        ? team.members.map((m) => m.name).join(', ')
                        : 'None'}
                    </p>
                    <button
                      onClick={() => {
                        setEditingTeamId(team.id);
                        setEditState({
                          id: team.id,
                          name: team.name,
                          leaderId: team.leaderId,
                          members: [...team.members],
                        });
                      }}
                      className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 ml-2"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
