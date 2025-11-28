import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction, Transaction } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";

// Program ID from deployment
export const ORACLE_PROGRAM_ID = new PublicKey("49ZgXvL4bGZfiTNojjGAigh5FpxccpJ6K9z3VL2LtvYe");

// Outcome enum
export enum Outcome {
  Yes = 0,
  No = 1,
}

// Market Status enum
export enum MarketStatus {
  Active = 0,
  Resolved = 1,
}

// Initialize provider
export function getProvider(wallet: AnchorWallet, connection: anchor.web3.Connection) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return provider;
}

// Get Market PDA
export function getMarketPDA(marketId: string) {
  const [marketPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("market"), Buffer.from(marketId)],
    ORACLE_PROGRAM_ID
  );
  return marketPDA;
}

// Get Market Escrow PDA
export function getMarketEscrowPDA(marketPubkey: PublicKey) {
  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("market_escrow"), marketPubkey.toBuffer()],
    ORACLE_PROGRAM_ID
  );
  return escrowPDA;
}

// Get Position PDA
export function getPositionPDA(
  userPubkey: PublicKey,
  marketPubkey: PublicKey,
  timestamp: number
) {
  const timestampBuffer = new ArrayBuffer(8);
  const view = new DataView(timestampBuffer);
  view.setBigInt64(0, BigInt(timestamp), true); // true = little endian
  
  const [positionPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("position"),
      userPubkey.toBuffer(),
      marketPubkey.toBuffer(),
      new Uint8Array(timestampBuffer),
    ],
    ORACLE_PROGRAM_ID
  );
  return positionPDA;
}

// Create Market instruction
export async function createMarket(
  provider: AnchorProvider,
  marketId: string,
  question: string,
  endTime: number
) {
  const marketPDA = getMarketPDA(marketId);
  const escrowPDA = getMarketEscrowPDA(marketPDA);

  // Calculate discriminator for create_market
  // Calculate discriminator for create_market using Node.js Buffer to avoid browser/TextEncoder/crypto compatibility issues
  const discriminatorHash = require('crypto').createHash('sha256').update("global:create_market").digest();
  const discriminator = discriminatorHash.subarray(0, 8);

  // Build instruction data
  const marketIdBuffer = Buffer.from(marketId);
  const marketIdLen = Buffer.alloc(4);
  marketIdLen.writeUInt32LE(marketIdBuffer.length);

  const questionBuffer = Buffer.from(question);
  const questionLen = Buffer.alloc(4);
  questionLen.writeUInt32LE(questionBuffer.length);

  const endTimeBuffer = Buffer.alloc(8);
  const endTimeView = new DataView(endTimeBuffer.buffer);
  endTimeView.setBigInt64(0, BigInt(endTime), true);

  const dataBuffer = new ArrayBuffer(
    discriminator.length + 
    4 + marketIdBuffer.length + 
    4 + questionBuffer.length + 
    8
  );
  const data = new Uint8Array(dataBuffer);
  
  let offset = 0;
  data.set(discriminator, offset);
  offset += discriminator.length;
  data.set(marketIdLen, offset);
  offset += 4;
  data.set(marketIdBuffer, offset);
  offset += marketIdBuffer.length;
  data.set(questionLen, offset);
  offset += 4;
  data.set(questionBuffer, offset);
  offset += questionBuffer.length;
  data.set(new Uint8Array(endTimeBuffer), offset);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: marketPDA, isSigner: false, isWritable: true },
      { pubkey: escrowPDA, isSigner: false, isWritable: true },
      { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: ORACLE_PROGRAM_ID,
    data: data as any,
  });

  const tx = new Transaction().add(instruction);
  const signature = await provider.sendAndConfirm(tx);

  return { signature, marketPDA };
}

// Place Stake instruction
export async function placeStake(
  provider: AnchorProvider,
  marketId: string,
  amount: number,
  outcome: Outcome
) {
  const marketPDA = getMarketPDA(marketId);
  const escrowPDA = getMarketEscrowPDA(marketPDA);
  const timestamp = Math.floor(Date.now() / 1000);
  const positionPDA = getPositionPDA(provider.wallet.publicKey, marketPDA, timestamp);

  const lamports = amount * LAMPORTS_PER_SOL;

  // Build instruction data: discriminator + amount + outcome + timestamp
  const discriminator = Buffer.from([22, 66, 171, 110, 117, 28, 158, 57]);
  
  const amountBuffer: ArrayBufferLike = new ArrayBuffer(8);
  const amountView = new DataView(amountBuffer);
  amountView.setBigUint64(0, BigInt(lamports), true);
  const amountBytes = new Uint8Array(amountBuffer);
  
  const outcomeBytes = Uint8Array.from([outcome]);
  
  // ADD TIMESTAMP
  const timestampBuffer: ArrayBufferLike = new ArrayBuffer(8);
  const timestampView = new DataView(timestampBuffer);
  timestampView.setBigInt64(0, BigInt(timestamp), true);
  const timestampBytes = new Uint8Array(timestampBuffer);

  const dataBuffer: ArrayBufferLike = new ArrayBuffer(
    discriminator.length + amountBytes.length + outcomeBytes.length + timestampBytes.length
  );
  const data = new Uint8Array(dataBuffer);
  data.set(discriminator, 0);
  data.set(amountBytes, discriminator.length);
  data.set(outcomeBytes, discriminator.length + amountBytes.length);
  data.set(timestampBytes, discriminator.length + amountBytes.length + outcomeBytes.length);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: marketPDA, isSigner: false, isWritable: true },
      { pubkey: escrowPDA, isSigner: false, isWritable: true },
      { pubkey: positionPDA, isSigner: false, isWritable: true },
      { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: ORACLE_PROGRAM_ID,
    data: data as any,
  });

  const tx = new Transaction().add(instruction);
  const signature = await provider.sendAndConfirm(tx);
  
  return { signature, positionPDA };
}

// Resolve Market instruction (authority only)
export async function resolveMarket(
  provider: AnchorProvider,
  marketId: string,
  winningOutcome: Outcome
) {
  const marketPDA = getMarketPDA(marketId);

  // Discriminator for resolve_market
  const discriminatorHash = require('crypto').createHash('sha256').update("global:resolve_market").digest();
  const discriminator = discriminatorHash.subarray(0, 8);

  const outcomeBytes = Uint8Array.from([winningOutcome]);

  const dataBuffer: ArrayBufferLike = new ArrayBuffer(discriminator.length + 1);
  const data = new Uint8Array(dataBuffer);
  data.set(discriminator, 0);
  data.set(outcomeBytes, discriminator.length);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: marketPDA, isSigner: false, isWritable: true },
      { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: false },
    ],
    programId: ORACLE_PROGRAM_ID,
    data: data as any,
  });

  const tx = new Transaction().add(instruction);
  const signature = await provider.sendAndConfirm(tx);

  return { signature, marketPDA };
}

// Claim Payout instruction
export async function claimPayout(
  provider: AnchorProvider,
  marketId: string,
  positionTimestamp: number
) {
  const marketPDA = getMarketPDA(marketId);
  const escrowPDA = getMarketEscrowPDA(marketPDA);
  const positionPDA = getPositionPDA(provider.wallet.publicKey, marketPDA, positionTimestamp);

  // Discriminator for claim_payout
  const discriminatorHash = require('crypto').createHash('sha256').update("global:claim_payout").digest();
  const discriminator = discriminatorHash.subarray(0, 8);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: marketPDA, isSigner: false, isWritable: true },
      { pubkey: escrowPDA, isSigner: false, isWritable: true },
      { pubkey: positionPDA, isSigner: false, isWritable: true },
      { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: ORACLE_PROGRAM_ID,
    data: discriminator as any,
  });

  const tx = new Transaction().add(instruction);
  const signature = await provider.sendAndConfirm(tx);

  return { signature, positionPDA };
}