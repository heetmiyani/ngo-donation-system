import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Users, IndianRupee, PieChart } from 'lucide-react';

interface DashboardStats {
  totalDonations: number;
  totalAmount: number;
  totalDonors: number;
  categoryBreakdown: {
    'Khichdi Ghar': number;
    'Tiffin Seva': number;
    'Other': number;
  };
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    totalAmount: 0,
    totalDonors: 0,
    categoryBreakdown: {
      'Khichdi Ghar': 0,
      'Tiffin Seva': 0,
      'Other': 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [donationsResult, donorsResult, categoryResult] = await Promise.all([
        supabase.from('donations').select('amount', { count: 'exact' }),
        supabase.from('donors').select('id', { count: 'exact' }),
        supabase.from('donations').select('category, amount'),
      ]);

      const totalAmount = donationsResult.data?.reduce((sum: number, d: any) => sum + Number(d.amount), 0) || 0;

      const categoryBreakdown = {
        'Khichdi Ghar': 0,
        'Tiffin Seva': 0,
        'Other': 0,
      };

      categoryResult.data?.forEach((d: any) => {
        categoryBreakdown[d.category as keyof typeof categoryBreakdown] += Number(d.amount);
      });

      setStats({
        totalDonations: donationsResult.count || 0,
        totalAmount,
        totalDonors: donorsResult.count || 0,
        categoryBreakdown,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Donations',
      value: stats.totalDonations,
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Amount Raised',
      value: `₹${stats.totalAmount.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Donors',
      value: stats.totalDonors,
      icon: Users,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-8 h-8 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <PieChart className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Category-wise Breakdown</h3>
        </div>

        <div className="space-y-4">
          {Object.entries(stats.categoryBreakdown).map(([category, amount]) => {
            const percentage = stats.totalAmount > 0
              ? ((amount / stats.totalAmount) * 100).toFixed(1)
              : '0';

            const colors: Record<string, string> = {
              'Khichdi Ghar': 'bg-blue-500',
              'Tiffin Seva': 'bg-green-500',
              'Other': 'bg-orange-500',
            };

            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-sm text-gray-600">
                    ₹{amount.toLocaleString('en-IN')} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${colors[category]} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
