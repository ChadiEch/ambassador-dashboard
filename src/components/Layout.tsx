// src/components/Layout.tsx
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = localStorage.getItem('role') || 'guest';

  const logout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const navItems = [{ label: 'Dashboard', path: '/dashboard' }];

  if (role === 'admin') {
    navItems.push(
      { label: 'Analytics', path: '/admin/admin-analytics' },
      { label: 'Feedback & Notes', path: '/admin/feedback' },
      { label: 'Moderation Panel', path: '/admin/moderation' },
      { label: 'User Management', path: '/admin/users' },
      { label: 'Team Management', path: '/admin/teams' },
      { label: 'Rules Management', path: '/admin/rules' },
      { label: 'Leaved Ambassadors', path: '/admin/inactive-users' },
    );
  }

  if (role === 'ambassador') {

    navItems.push({ label: 'Rules', path: '/rules' },  { label: 'Notes', path: '/MyNotes'},
);
  }
  if (role === 'leader') {

    navItems.push( { label: 'Notes', path: '/MyNotes'},
      { label: 'anlytics', path: '/leader-analytics' },
);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobile Topbar */}
      <div className="flex items-center justify-between bg-white px-4 py-3 shadow-md md:hidden">
        <div className="text-indigo-600 font-bold text-xl">{role.charAt(0).toUpperCase() + role.slice(1)}</div>
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? (
            <XMarkIcon  className="w-6 h-6 text-gray-700" />
            
          ) : (
            <Bars3Icon  className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar / Drawer */}
      <aside className={`bg-white shadow-md w-64 md:block ${menuOpen ? 'block' : 'hidden'} md:h-auto`}>
        <div className="p-4 font-bold text-indigo-600 text-xl border-b border-gray-200 hidden md:block">
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMenuOpen(false); // Close drawer on mobile
              }}
              className="block w-full text-left text-gray-700 hover:bg-indigo-100 px-4 py-2 rounded-md"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-4">
            <button
              onClick={logout}
              className="w-full text-left text-red-600 hover:bg-red-100 px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <header className="mb-6 border-b pb-2">
          <h1 className="text-2xl font-semibold text-gray-800">
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </h1>
          <nav className="mt-2 space-x-4 text-sm text-indigo-700 hidden md:block">
            {navItems.map((item) => (
              <button
                key={item.path + '-top'}
                onClick={() => navigate(item.path)}
                className="hover:underline"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>
        <div>{children}</div>
      </main>
    </div>
  );
}
