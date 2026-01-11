
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Scissors, User as UserIcon, LayoutDashboard, Settings, LogOut, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  logout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, logout }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Mashal Patterns</span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center space-x-8">
                <Link to="/dashboard" className={`flex items-center space-x-1 text-sm font-medium ${location.pathname === '/dashboard' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/workspace" className={`flex items-center space-x-1 text-sm font-medium ${location.pathname === '/workspace' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>
                  <Scissors className="h-4 w-4" />
                  <span>Workspace</span>
                </Link>
                {user.role === UserRole.ADMIN && (
                  <Link to="/admin" className={`flex items-center space-x-1 text-sm font-medium ${location.pathname === '/admin' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </nav>
            )}

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()} User</p>
                  </div>
                  <button onClick={logout} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Login / Join Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">About</h3>
              <p className="text-sm text-gray-500">
                Mashal Patterns is an independent educational tool for fashion students and beginner entrepreneurs.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-sm text-gray-500 hover:text-indigo-600">Terms of Use</Link></li>
                <li><Link to="#" className="text-sm text-gray-500 hover:text-indigo-600">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Support</h3>
              <p className="text-sm text-gray-500">Created for fashion excellence in Ghana and beyond.</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center">
            <p className="text-xs text-gray-400 italic">
              "Mashal Patterns is an independent educational tool and is not affiliated with any university or institution."
            </p>
            <p className="text-xs text-gray-500 mt-2">
              © {new Date().getFullYear()} Mashal Patterns. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
