import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// Network configuration
const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta') || 'devnet';
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl(NETWORK);

// Create connection
export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Program ID (will be set after Anchor deployment)
export const ORACLE_PROGRAM_ID = process.env.NEXT_PUBLIC_ORACLE_PROGRAM_ID 
  ? new PublicKey(process.env.NEXT_PUBLIC_ORACLE_PROGRAM_ID)
  : null;

// Helper: Get SOL balance
export async function getBalance(publicKey: PublicKey): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / 1e9; // Convert lamports to SOL
}

// Helper: Confirm transaction
export async function confirmTransaction(signature: string) {
  const latestBlockhash = await connection.getLatestBlockhash();
  
  return await connection.confirmTransaction({
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  });
}

// Helper: Format wallet address
export function formatWalletAddress(address: string, length: number = 4): string {
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

// Helper: Calculate odds from pools
export function calculateOdds(poolYes: number, poolNo: number): { yes: number; no: number } {
  const total = poolYes + poolNo;
  if (total === 0) return { yes: 0.5, no: 0.5 };
  
  return {
    yes: poolYes / total,
    no: poolNo / total
  };
}

// Helper: Calculate potential payout
export function calculatePayout(
  stakeAmount: number,
  outcome: 'yes' | 'no',
  poolYes: number,
  poolNo: number
): number {
  const totalPool = poolYes + poolNo;
  const winningPool = outcome === 'yes' ? poolYes : poolNo;
  const losingPool = outcome === 'yes' ? poolNo : poolYes;
  
  if (winningPool === 0) return stakeAmount + losingPool;
  
  const share = stakeAmount / (winningPool + stakeAmount);
  return stakeAmount + (losingPool * share);
}