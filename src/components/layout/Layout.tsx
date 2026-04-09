import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import { Calendar, Home, Users, Activity, LogOut, Menu, Shield } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Layout() {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = useMemo(() => {
    const baseItems = [
      { name: 'Dashboard', path: '/', icon: Home },
      { name: 'Events', path: '/events', icon: Calendar },
      { name: 'Players', path: '/players', icon: Users },
      { name: 'My Profile', path: `/profile/${user?.id}`, icon: Activity },
    ];

    if (profile?.role === 'coach' || profile?.role === 'admin') {
      baseItems.splice(3, 0, { name: 'Coach Tools', path: '/coach', icon: Shield });
    }

    return baseItems;
  }, [profile?.role, user?.id]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-red-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center font-bold text-red-900">RP</div>
                <span className="font-bold text-xl tracking-tight">Ruby Phoenixes</span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-4 items-center">
              {user && navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              {user && (
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-red-700">
                  <span className="text-sm font-medium text-red-100">{profile?.full_name || user.email}</span>
                  <Button variant="secondary" size="sm" onClick={handleSignOut} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              )}
            </nav>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md hover:bg-red-700 focus:outline-none">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && user && (
          <div className="md:hidden bg-red-900 px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium hover:bg-red-800"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-red-800">
              <div className="px-3 py-2 text-sm text-red-200">Signed in as {profile?.full_name || user.email}</div>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-amber-500 hover:bg-red-800"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
