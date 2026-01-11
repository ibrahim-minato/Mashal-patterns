
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Users, BarChart3, Shield, Mail, Ban, MoreVertical, Search, CheckCircle, Award } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [users] = useState<User[]>([
    { id: '1', email: 'student1@mashal.edu', displayName: 'Kwame Mensah', role: UserRole.FREE, projectsCount: 3 },
    { id: '2', email: 'designer@tailor.com', displayName: 'Efua Atta', role: UserRole.PREMIUM, projectsCount: 12 },
    { id: '3', email: 'admin@mashal.com', displayName: 'Admin Mashal', role: UserRole.ADMIN, projectsCount: 0 },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-gray-500 mt-1">Manage users, roles, and platform health.</p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
          <Shield className="h-4 w-4" />
          <span>Restricted Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Users', value: '1,248', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Active Projects', value: '4,892', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Premium Subscriptions', value: '156', icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Pending Support', value: '12', icon: Mail, color: 'text-amber-600', bg: 'bg-amber-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className={`${stat.bg} ${stat.color} p-2 rounded-lg w-fit mb-4`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <input type="text" placeholder="Search by name or email..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Projects</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900">{user.displayName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === UserRole.ADMIN ? 'bg-red-100 text-red-700' :
                      user.role === UserRole.PREMIUM ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.projectsCount}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                       <button title="Change Role" className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50">
                          <CheckCircle className="h-4 w-4" />
                       </button>
                       <button title="Suspend Account" className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50">
                          <Ban className="h-4 w-4" />
                       </button>
                       <button className="p-1.5 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
