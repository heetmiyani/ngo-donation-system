export type Database = {
  public: {
    Tables: {
      donors: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          donor_id: string;
          amount: number;
          category: 'Khichdi Ghar' | 'Tiffin Seva' | 'Other';
          receipt_id: string;
          donation_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          donor_id: string;
          amount: number;
          category: 'Khichdi Ghar' | 'Tiffin Seva' | 'Other';
          receipt_id: string;
          donation_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string;
          amount?: number;
          category?: 'Khichdi Ghar' | 'Tiffin Seva' | 'Other';
          receipt_id?: string;
          donation_date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};

export type Donor = Database['public']['Tables']['donors']['Row'];
export type Donation = Database['public']['Tables']['donations']['Row'];

export type DonationWithDonor = Donation & {
  donors: Donor;
};
