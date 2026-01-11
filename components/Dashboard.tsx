
import React from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Plus, Scissors, FileText, ChevronRight, Award } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isPremium = user.role !== UserRole.FREE;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.displayName}</h1>
          <p className="text-gray-500 mt-1">Start a new project or continue your drafting.</p>
        </div>
        {!isPremium && (
          <div className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white shadow-lg flex items-center justify-between">
            <div className="mr-6">
               <div className="flex items-center space-x-2 mb-1">
                 <Award className="h-5 w-5" />
                 <span className="font-bold uppercase tracking-wider text-xs">Unlock Premium</span>
               </div>
               <p className="text-sm opacity-90">Get AI-powered pattern generation & watermark-free PDFs.</p>
            </div>
            <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
              Upgrade
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Projects */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your Recent Projects</h2>
              <Link to="/workspace" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/workspace" className="group border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                <div className="bg-gray-100 group-hover:bg-indigo-100 p-3 rounded-full mb-4 transition-colors">
                  <Plus className="h-6 w-6 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <span className="font-medium text-gray-900">Start New Pattern</span>
              </Link>
              
              {/* Dummy Project */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="h-32 bg-gray-100 flex items-center justify-center">
                  <Scissors className="h-10 w-10 text-gray-300" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900">Sample Skirt Block</h3>
                  <p className="text-xs text-gray-500">Last edited 2 days ago</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Tutorials */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Educational Guides</h2>
            <div className="space-y-4">
              {[
                { name: 'Basic Bodice Block', level: 'Beginner', duration: '15 mins' },
                { name: 'A-Line Skirt Fundamentals', level: 'Beginner', duration: '10 mins' },
                { name: 'Standard Sleeve Construction', level: 'Intermediate', duration: '20 mins' },
              ].map((tutorial, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{tutorial.name}</h4>
                      <p className="text-xs text-gray-500">{tutorial.level} • {tutorial.duration}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Student Progress</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Drafting Accuracy</span>
                  <span className="font-bold">78%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Tutorials Completed</span>
                  <span className="font-bold">4 / 12</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 text-white p-6 rounded-xl shadow-xl">
            <h3 className="font-bold text-lg mb-2">Ghanaian Fashion Standards</h3>
            <p className="text-sm text-gray-400 mb-4">Learn local measurements and standard sizes used in the regional industry.</p>
            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Read Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
