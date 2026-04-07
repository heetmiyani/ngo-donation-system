import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Donor } from '../types/database';
import { UserPlus, Search } from 'lucide-react';

interface DonationFormProps {
  onSuccess: () => void;
}

export function DonationForm({ onSuccess }: DonationFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'Khichdi Ghar' | 'Tiffin Seva' | 'Other'>('Khichdi Ghar');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Donor[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('donors')
          .select('*')
          .or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
          .limit(5);

        if (error) throw error;
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error searching donors:', err);
      }
    }, 300);
  }, [searchQuery]);

  const selectDonor = (donor: Donor) => {
    setSelectedDonor(donor);
    setName(donor.name);
    setPhone(donor.phone || '');
    setEmail(donor.email || '');
    setSearchQuery(donor.name);
    setShowSuggestions(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setName(value);
    setSelectedDonor(null);
  };

  const generateReceiptId = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_receipt_id' as any);
    if (error || !data) {
      const timestamp = Date.now();
      return `RCP-${timestamp}`;
    }
    return data as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let donorId: string;

      if (selectedDonor) {
        donorId = selectedDonor.id;

        if (phone !== selectedDonor.phone || email !== selectedDonor.email) {
          const { error: updateError } = await supabase
            .from('donors')
            .update({
              phone: phone || null,
              email: email || null,
            }as any)
            .eq('id', donorId);

          if (updateError) throw updateError;
        }
      } else {
        let existingDonor = null;

        if (phone) {
          const { data } = await supabase
            .from('donors')
            .select('*')
            .eq('phone', phone)
            .maybeSingle();
          existingDonor = data as Donor | null;
        }

        if (!existingDonor && name) {
          const { data } = await supabase
            .from('donors')
            .select('*')
            .ilike('name', name)
            .maybeSingle();
          existingDonor = data as Donor | null;
        }

        if (existingDonor) {
          donorId = existingDonor.id;

          const { error: updateError } = await supabase
            .from('donors')
            .update({
              phone: phone || existingDonor.phone,
              email: email || existingDonor.email,
            }as any)
            .eq('id', donorId);

          if (updateError) throw updateError;
        } else {
          const { data: newDonor, error: donorError } = await supabase
            .from('donors')
            .insert({
              name: name.trim(),
              phone: phone || null,
              email: email || null,
            }as any)
            .select()
            .single();
          
          if (donorError) throw donorError;
          donorId = (newDonor as any).id;
        }
      }

      const receiptId = await generateReceiptId();

      const { error: donationError } = await supabase
        .from('donations')
        .insert({
          donor_id: donorId,
          amount: parseFloat(amount),
          category,
          receipt_id: receiptId,
          notes: notes || null,
        }as any);

      if (donationError) throw donationError;

      setSuccess(`Donation recorded successfully! Receipt ID: ${receiptId}`);

      setName('');
      setPhone('');
      setEmail('');
      setAmount('');
      setCategory('Khichdi Ghar');
      setNotes('');
      setSearchQuery('');
      setSelectedDonor(null);

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to record donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <UserPlus className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Record Donation</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Donor or Enter Name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type name or phone to search..."
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((donor) => (
                <button
                  key={donor.id}
                  type="button"
                  onClick={() => selectDonor(donor)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{donor.name}</div>
                  {donor.phone && (
                    <div className="text-sm text-gray-600">{donor.phone}</div>
                  )}
                  {donor.email && (
                    <div className="text-sm text-gray-500">{donor.email}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="donor@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Khichdi Ghar">Khichdi Ghar</option>
              <option value="Tiffin Seva">Tiffin Seva</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional notes about this donation..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-800 rounded-lg text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Record Donation'}
        </button>
      </form>
    </div>
  );
}
