import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Market {
  id: string;
  market_id: string;
  question: string;
  description: string | null;
  end_time: string;
  resolution_criteria: string;
  status: 'active' | 'resolved' | 'cancelled';
  winning_outcome: 'yes' | 'no' | null;
  pool_yes: number;
  pool_no: number;
  total_volume: number;
  participant_count: number;
  sentiment_score: number;
  sentiment_confidence: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface Position {
  id: string;
  user_wallet: string;
  market_id: string;
  outcome: 'yes' | 'no';
  stake_amount: number;
  odds_at_stake: number;
  potential_payout: number;
  claimed: boolean;
  payout_amount: number;
  transaction_signature: string | null;
  // Timestamp used on-chain to derive the position PDA
  onchain_timestamp: number;
  created_at: string;
  claimed_at: string | null;
}

export interface User {
  wallet_address: string;
  reputation_score: number;
  total_volume: number;
  total_positions: number;
  winning_positions: number;
  losing_positions: number;
  win_rate: number;
  total_profit: number;
  reputation_tier: 'novice' | 'apprentice' | 'expert' | 'master' | 'oracle';
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  source: 'twitter' | 'discord' | 'governance' | 'manual';
  content: string;
  url: string | null;
  author: string | null;
  relevance_score: number;
  sentiment: number | null;
  entities: any;
  related_markets: string[];
  processed: boolean;
  created_at: string;
}

// ============================================
// MARKET SERVICES
// ============================================

export const marketService = {
  async getAll() {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Market[];
  },

  async getActive() {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .eq('status', 'active')
      .order('end_time', { ascending: true });
    
    if (error) throw error;
    return data as Market[];
  },

  async getById(marketId: string) {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .eq('market_id', marketId)
      .single();
    
    if (error) throw error;
    return data as Market;
  },

  async create(market: Omit<Market, 'id' | 'created_at' | 'updated_at' | 'resolved_at'>) {
    const { data, error } = await supabase
      .from('markets')
      .insert([market])
      .select()
      .single();
    
    if (error) throw error;
    return data as Market;
  },

  async updateSentiment(marketId: string, sentiment: number, confidence: number) {
    const { data, error } = await supabase
      .from('markets')
      .update({ 
        sentiment_score: sentiment,
        sentiment_confidence: confidence
      })
      .eq('market_id', marketId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Market;
  },

  async updatePools(marketId: string, poolYes: number, poolNo: number) {
    const { data, error } = await supabase
      .from('markets')
      .update({ 
        pool_yes: poolYes,
        pool_no: poolNo
      })
      .eq('market_id', marketId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Market;
  },

  async resolve(marketId: string, winningOutcome: 'yes' | 'no') {
    const { data, error } = await supabase
      .from('markets')
      .update({ 
        status: 'resolved',
        winning_outcome: winningOutcome,
        resolved_at: new Date().toISOString()
      })
      .eq('market_id', marketId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Market;
  },

  // Realtime subscription
  subscribeToMarket(marketId: string, callback: (market: Market) => void) {
    return supabase
      .channel(`market:${marketId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'markets',
          filter: `market_id=eq.${marketId}`
        },
        (payload) => callback(payload.new as Market)
      )
      .subscribe();
  }
};

// ============================================
// POSITION SERVICES
// ============================================

export const positionService = {
  async getByUser(wallet: string) {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('user_wallet', wallet)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Position[];
  },

  async getByMarket(marketId: string) {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('market_id', marketId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Position[];
  },

  async create(position: Omit<Position, 'id' | 'created_at' | 'claimed_at'>) {
    const { data, error } = await supabase
      .from('positions')
      .insert([position])
      .select()
      .single();
    
    if (error) throw error;
    return data as Position;
  },

  async claim(positionId: string, payoutAmount: number) {
    const { data, error } = await supabase
      .from('positions')
      .update({ 
        claimed: true,
        payout_amount: payoutAmount,
        claimed_at: new Date().toISOString()
      })
      .eq('id', positionId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Position;
  }
};

// ============================================
// USER SERVICES
// ============================================

export const userService = {
  async getByWallet(wallet: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', wallet)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as User | null;
  },

  async createOrUpdate(wallet: string) {
    const existing = await this.getByWallet(wallet);
    
    if (existing) return existing;
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ wallet_address: wallet }])
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  async getLeaderboard(limit: number = 10) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('total_volume', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as User[];
  }
};

// ============================================
// EVENT SERVICES
// ============================================

export const eventService = {
  async create(event: Omit<Event, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();
    
    if (error) throw error;
    return data as Event;
  },

  async getUnprocessed() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('processed', false)
      .order('relevance_score', { ascending: false });
    
    if (error) throw error;
    return data as Event[];
  },

  async markProcessed(eventId: string) {
    const { error } = await supabase
      .from('events')
      .update({ processed: true })
      .eq('id', eventId);
    
    if (error) throw error;
  }
};