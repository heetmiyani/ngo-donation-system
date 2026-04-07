import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Donor, Donation } from '../types/database';
import { Search, Download, Printer, Calendar } from 'lucide-react';
import { printReceipt, downloadReceipt } from '../utils/receiptGenerator';

interface DonorWithStats extends Donor {
  totalDonated: number;
  donationCount: number;
}

export function DonorHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [donors, setDonors] = useState<DonorWithStats[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<DonorWithStats | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchQuery.length < 2) {
      setDonors([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data: donorsData, error } = await supabase
          .from('donors')
          .select(`
            *,
            donations (amount)
          `)
          .or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);

        if (error) throw error;

        const donorsWithStats: DonorWithStats[] = (donorsData || []).map((donor: any) => {
          const totalDonated = donor.donations?.reduce(
            (sum: number, d: any) => sum + Number(d.amount),
            0
          ) || 0;
          const donationCount = donor.donations?.length || 0;

          return {
            id: donor.id,
            name: donor.name,
            phone: donor.phone,
            email: donor.email,
            created_at: donor.created_at,
            updated_at: donor.updated_at,
            totalDonated,
            donationCount,
          };
        });

        setDonors(donorsWithStats);
      } catch (error) {
        console.error('Error searching donors:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [searchQuery]);

  const loadDonorDonations = async (donor: DonorWithStats) => {
    setSelectedDonor(donor);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('donor_id', donor.id)
        .order('donation_date', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Search Donor History</h3>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone number..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading && searchQuery.length >= 2 && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {donors.length > 0 && (
          <div className="mt-4 space-y-2">
            {donors.map((donor) => (
              <button
                key={donor.id}
                onClick={() => loadDonorDonations(donor)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedDonor?.id === donor.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{donor.name}</h4>
                    {donor.phone && (
                      <p className="text-sm text-gray-600">{donor.phone}</p>
                    )}
                    {donor.email && (
                      <p className="text-sm text-gray-500">{donor.email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ₹{donor.totalDonated.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {donor.donationCount} {donor.donationCount === 1 ? 'donation' : 'donations'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {searchQuery.length >= 2 && !loading && donors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No donors found matching your search.
          </div>
        )}
      </div>

      {selectedDonor && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Donation History - {selectedDonor.name}
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No donations found for this donor.
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        ₹{Number(donation.amount).toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-gray-600">{donation.category}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(donation.donation_date).toLocaleDateString('en-IN')}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Receipt ID: {donation.receipt_id}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => printReceipt(donation, selectedDonor)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                      <button
                        onClick={() => downloadReceipt(donation, selectedDonor)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>

                  {donation.notes && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      Note: {donation.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
