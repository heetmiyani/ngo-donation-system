import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dashboard } from './Dashboard';
import { DonationForm } from './DonationForm';
import { DonorHistory } from './DonorHistory';
import { LayoutDashboard, PlusCircle, History, LogOut, Heart } from 'lucide-react';

type Tab = 'dashboard' | 'donate' | 'history';

export function Layout() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDonationSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'donate' as Tab, label: 'New Donation', icon: PlusCircle },
    { id: 'history' as Tab, label: 'Donor History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Heart className="w-8 h-8 text-green-600" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  NGO Donation Management
                </h1>
                <p className="text-sm text-gray-600">Track and manage donations efficiently</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 sticky top-[88px] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard key={refreshKey} />}
        {activeTab === 'donate' && <DonationForm onSuccess={handleDonationSuccess} />}
        {activeTab === 'history' && <DonorHistory key={refreshKey} />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Built with care for making a difference in our community
          </p>
        </div>
      </footer>
    </div>
  );
}
