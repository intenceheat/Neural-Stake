import { supabase, positionService, marketService, userService } from './supabase';

export interface StakeParams {
  userWallet: string;
  marketId: string;
  outcome: 'yes' | 'no';
  stakeAmount: number;
}

export interface StakeResult {
  success: boolean;
  position?: any;
  error?: string;
}

export const stakingService = {
  /**
   * Place a stake on a market
   * Updates: positions table, market pools, user stats
   */
  async placeStake(params: StakeParams): Promise<StakeResult> {
    const { userWallet, marketId, outcome, stakeAmount } = params;
  
    try {
      // 1. Get current market data
      const market = await marketService.getById(marketId);
      
      if (!market) {
        return { success: false, error: 'Market not found' };
      }
  
      if (market.status !== 'active') {
        return { success: false, error: 'Market is not active' };
      }
  
      // 2. Calculate total pool
      const totalPool = market.pool_yes + market.pool_no;
  
      // 3. Calculate potential payout
      let oddsDecimal: number;
      let potentialPayout: number;
  
      if (totalPool === 0) {
        // No bets yet - treat as 50/50
        oddsDecimal = 2.0;
        potentialPayout = stakeAmount * 2.0;
      } else {
        // Calculate odds based on pool
        const yourPoolSize = outcome === 'yes' ? market.pool_yes : market.pool_no;
        const opposingPoolSize = outcome === 'yes' ? market.pool_no : market.pool_yes;
        
        if (yourPoolSize === 0 && opposingPoolSize > 0) {
          potentialPayout = stakeAmount + opposingPoolSize;
        } else if (yourPoolSize > 0) {
          const totalAfterStake = totalPool + stakeAmount;
          const yourPoolAfterStake = yourPoolSize + stakeAmount;
          potentialPayout = (totalAfterStake / yourPoolAfterStake) * stakeAmount;
        } else {
          potentialPayout = stakeAmount * 2.0;
        }
      }
  
      // Ensure payout is never null/NaN/undefined
      if (!potentialPayout || isNaN(potentialPayout) || potentialPayout <= 0) {
        potentialPayout = stakeAmount * 2.0;
      }
  
      // Calculate odds for display
      oddsDecimal = potentialPayout / stakeAmount;
      const currentOddsForDisplay = (1 / oddsDecimal) * 100;
  
      // 4. Create position
      // Use a consistent on-chain timestamp for PDA derivation & later claims
      const onchainTimestamp = Math.floor(Date.now() / 1000);
      const position = await positionService.create({
        user_wallet: userWallet,
        market_id: marketId,
        outcome: outcome,
        stake_amount: stakeAmount,
        odds_at_stake: currentOddsForDisplay,
        potential_payout: potentialPayout,
        claimed: false,
        payout_amount: 0,
        transaction_signature: null,
        onchain_timestamp: onchainTimestamp,
      });

      // 5. Update market pools
      const newPoolYes = outcome === 'yes' 
        ? market.pool_yes + stakeAmount 
        : market.pool_yes;
      const newPoolNo = outcome === 'no' 
        ? market.pool_no + stakeAmount 
        : market.pool_no;

      await marketService.updatePools(marketId, newPoolYes, newPoolNo);

      // 6. Update participant count (check if user's first stake on this market)
      const userPositions = await positionService.getByMarket(marketId);
      const isNewParticipant = !userPositions.some(p => p.user_wallet === userWallet && p.id !== position.id);
      
      if (isNewParticipant) {
        await supabase
          .from('markets')
          .update({ participant_count: market.participant_count + 1 })
          .eq('market_id', marketId);
      }

      // 7. Create or update user record
      await userService.createOrUpdate(userWallet);

      // 8. Update user total volume
const { data: userData } = await supabase
.from('users')
.select('total_volume, total_positions')
.eq('wallet_address', userWallet)
.single();

if (userData) {
await supabase
  .from('users')
  .update({ 
    total_volume: userData.total_volume + stakeAmount,
    total_positions: userData.total_positions + 1
  })
  .eq('wallet_address', userWallet);
}
      return { 
        success: true, 
        position 
      };

    } catch (error: any) {
      console.error('Full staking error:', error);
      console.error('Error message:', error?.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { 
        success: false, 
        error: error?.message || error?.error_description || error?.hint || 'Failed to place stake. Check console for details.' 
      };
    }
  },

  /**
   * Get user's positions across all markets
   */
  async getUserPositions(wallet: string) {
    return await positionService.getByUser(wallet);
  },

  /**
   * Get positions for a specific market
   */
  async getMarketPositions(marketId: string) {
    return await positionService.getByMarket(marketId);
  }
};