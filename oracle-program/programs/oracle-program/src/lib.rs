// programs/oracle-program/src/lib.rs - REPLACE EVERYTHING

use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;

declare_id!("BhCVTNcTnrzRxZSayuX3kYBJZ36mUk5VB7C7k6uuhpDj");

#[program]
pub mod oracle_program {
    use super::*;

    // Initialize a new prediction market
    pub fn create_market(
        ctx: Context<CreateMarket>,
        market_id: String,
        question: String,
        end_time: i64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.authority = ctx.accounts.authority.key();
        market.market_id = market_id;
        market.question = question;
        market.pool_yes = 0;
        market.pool_no = 0;
        market.total_volume = 0;
        market.end_time = end_time;
        market.status = MarketStatus::Active;
        market.winning_outcome = None;
        market.bump = ctx.bumps.market;
        
        msg!("Market created: {}", market.question);
        Ok(())
    }

    // Place a stake on YES or NO
    pub fn place_stake(
        ctx: Context<PlaceStake>,
        amount: u64,
        outcome: Outcome,
        timestamp: i64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let position = &mut ctx.accounts.position;
        let clock = Clock::get()?;

        // Validate market is active
        require!(market.status == MarketStatus::Active, ErrorCode::MarketNotActive);
        require!(clock.unix_timestamp < market.end_time, ErrorCode::MarketExpired);
        require!(amount > 0, ErrorCode::InvalidAmount);

        // Calculate odds before stake
        let total_pool = market.pool_yes + market.pool_no;
        let odds_at_stake = if total_pool == 0 {
            5000 // 50% if first stake
        } else {
            match outcome {
                Outcome::Yes => (market.pool_yes * 10000) / total_pool,
                Outcome::No => (market.pool_no * 10000) / total_pool,
            }
        };

        // Transfer SOL from user to market escrow
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.market_escrow.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.market_escrow.to_account_info(),
            ],
        )?;

        // Update market pools
        match outcome {
            Outcome::Yes => market.pool_yes += amount,
            Outcome::No => market.pool_no += amount,
        }
        market.total_volume += amount;

        // Calculate potential payout (AMM formula)
        let new_total = market.pool_yes + market.pool_no;
        let potential_payout = if new_total > 0 {
            match outcome {
                Outcome::Yes => (new_total * amount) / market.pool_yes,
                Outcome::No => (new_total * amount) / market.pool_no,
            }
        } else {
            amount * 2
        };

        // Record position
        position.user = ctx.accounts.user.key();
        position.market = market.key();
        position.stake_amount = amount;
        position.outcome = outcome;
        position.odds_at_stake = odds_at_stake;
        position.potential_payout = potential_payout;
        position.payout_amount = 0;
        position.claimed = false;
        position.created_at = clock.unix_timestamp;
        position.bump = ctx.bumps.position;

        msg!(
            "Stake placed: {} SOL on {:?} | Odds: {}%",
            amount as f64 / LAMPORTS_PER_SOL as f64,
            outcome,
            odds_at_stake / 100
        );
        Ok(())
    }

    // Resolve market and set winning outcome
    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        winning_outcome: Outcome,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        
        // Only authority can resolve
        require!(
            ctx.accounts.authority.key() == market.authority,
            ErrorCode::Unauthorized
        );
        require!(market.status == MarketStatus::Active, ErrorCode::MarketAlreadyResolved);

        market.status = MarketStatus::Resolved;
        market.winning_outcome = Some(winning_outcome);

        msg!("Market resolved: {:?} wins", winning_outcome);
        Ok(())
    }

    // Claim winnings from resolved market
    pub fn claim_payout(ctx: Context<ClaimPayout>) -> Result<()> {
        let market = &ctx.accounts.market;
        let position = &mut ctx.accounts.position;

        // Validate
        require!(market.status == MarketStatus::Resolved, ErrorCode::MarketNotResolved);
        require!(!position.claimed, ErrorCode::AlreadyClaimed);
        require!(position.user == ctx.accounts.user.key(), ErrorCode::Unauthorized);

        let winning_outcome = market.winning_outcome.ok_or(ErrorCode::NoWinner)?;
        
        // Calculate payout
        let payout = if position.outcome == winning_outcome {
            // Winner gets proportional share of total pool
            let winning_pool = match winning_outcome {
                Outcome::Yes => market.pool_yes,
                Outcome::No => market.pool_no,
            };
            let total_pool = market.pool_yes + market.pool_no;
            
            if winning_pool > 0 {
                (total_pool * position.stake_amount) / winning_pool
            } else {
                0
            }
        } else {
            // Loser gets nothing
            0
        };

        if payout > 0 {
            // ✅ FIX: use system transfer + PDA signer instead of mutating lamports directly
            let market_key = market.key();

            // PDA signer seeds for market_escrow
            let seeds: &[&[u8]] = &[
                b"market_escrow",
                market_key.as_ref(),
                &[ctx.bumps.market_escrow],
            ];

            let ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.market_escrow.key(),
                &ctx.accounts.user.key(),
                payout,
            );

            anchor_lang::solana_program::program::invoke_signed(
                &ix,
                &[
                    ctx.accounts.market_escrow.to_account_info(),
                    ctx.accounts.user.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[seeds],
            )?;
        }

        position.payout_amount = payout;
        position.claimed = true;

        msg!(
            "Payout claimed: {} SOL",
            payout as f64 / LAMPORTS_PER_SOL as f64
        );
        Ok(())
    }
}

// Account structs
#[derive(Accounts)]
#[instruction(market_id: String)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Market::INIT_SPACE,
        seeds = [b"market", market_id.as_bytes()],
        bump
    )]
    pub market: Account<'info, Market>,
    
    /// CHECK: Market escrow PDA to hold funds
    #[account(
        mut,
        seeds = [b"market_escrow", market.key().as_ref()],
        bump
    )]
    pub market_escrow: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, outcome: Outcome, timestamp: i64)]
pub struct PlaceStake<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    /// CHECK: Market escrow PDA
    #[account(
        mut,
        seeds = [b"market_escrow", market.key().as_ref()],
        bump
    )]
    pub market_escrow: AccountInfo<'info>,
    
    #[account(
        init,
        payer = user,
        space = 8 + Position::INIT_SPACE,
        seeds = [
            b"position",
            user.key().as_ref(),
            market.key().as_ref(),
            &timestamp.to_le_bytes()
        ],
        bump
    )]
    pub position: Account<'info, Position>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimPayout<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    /// CHECK: Market escrow PDA
    #[account(
        mut,
        seeds = [b"market_escrow", market.key().as_ref()],
        bump
    )]
    pub market_escrow: AccountInfo<'info>,
    
    #[account(mut)]
    pub position: Account<'info, Position>,
    
    #[account(mut)]
    pub user: Signer<'info>,

    // ✅ needed for system_instruction::transfer
    pub system_program: Program<'info, System>,
}

// Data structures
#[account]
#[derive(InitSpace)]
pub struct Market {
    pub authority: Pubkey,
    #[max_len(50)]
    pub market_id: String,
    #[max_len(200)]
    pub question: String,
    pub pool_yes: u64,
    pub pool_no: u64,
    pub total_volume: u64,
    pub end_time: i64,
    pub status: MarketStatus,
    pub winning_outcome: Option<Outcome>,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Position {
    pub user: Pubkey,
    pub market: Pubkey,
    pub stake_amount: u64,
    pub outcome: Outcome,
    pub odds_at_stake: u64,
    pub potential_payout: u64,
    pub payout_amount: u64,
    pub claimed: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MarketStatus {
    Active,
    Resolved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum Outcome {
    Yes,
    No,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Market is not active")]
    MarketNotActive,
    #[msg("Market has expired")]
    MarketExpired,
    #[msg("Invalid stake amount")]
    InvalidAmount,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Market already resolved")]
    MarketAlreadyResolved,
    #[msg("Market not resolved yet")]
    MarketNotResolved,
    #[msg("Payout already claimed")]
    AlreadyClaimed,
    #[msg("No winning outcome set")]
    NoWinner,
}