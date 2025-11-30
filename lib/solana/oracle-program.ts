import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction, Transaction } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";

// Program ID from deployment
export const ORACLE_PROGRAM_ID = new PublicKey("BhCVTNcTnrzRxZSayuX3kYBJZ36mUk5VB7C7k6uuhpDj");

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

// Get Market Escrow PDA with verification
export async function getMarketEscrowPDAWithVerification(
  connection: anchor.web3.Connection,
  marketPubkey: PublicKey
): Promise<PublicKey> {
  // Derive escrow PDA using standard method
  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("market_escrow"), marketPubkey.toBuffer()],
    ORACLE_PROGRAM_ID
  );
  
  // Verify it exists on-chain
  const accountInfo = await connection.getAccountInfo(escrowPDA);
  if (!accountInfo) {
    throw new Error(
      `Market escrow PDA not found: ${escrowPDA.toBase58()}. ` +
      `Market PDA: ${marketPubkey.toBase58()}. ` +
      `This might indicate the market was created with a different market_id.`
    );
  }
  
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
  
  return { signature, positionPDA, timestamp };
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
  // Trim marketId to ensure no whitespace issues
  const cleanMarketId = marketId.trim();
  const marketPDA = getMarketPDA(cleanMarketId);
  
  console.log("🔍 Claim Payout Debug:", {
    marketId,
    marketPDA: marketPDA.toBase58(),
    positionTimestamp,
  });
  
  // Fetch the market account to ensure we have the correct PDA
  const marketAccountInfo = await provider.connection.getAccountInfo(marketPDA);
  if (!marketAccountInfo) {
    throw new Error(`Market account not found: ${marketPDA.toBase58()}. Market ID: ${marketId}`);
  }
  
  // Verify the market account is owned by our program
  if (!marketAccountInfo.owner.equals(ORACLE_PROGRAM_ID)) {
    throw new Error(`Market account is not owned by the oracle program. Owner: ${marketAccountInfo.owner.toBase58()}`);
  }
  
  // The market account's key IS the marketPDA, so we use that directly
  // Derive escrow PDA - verify it exists on-chain
  // The Rust program uses market.key().as_ref() which is the market's PublicKey bytes
  // We need to use the marketPDA (which is market.key()) to derive the escrow
  const escrowPDA = await getMarketEscrowPDAWithVerification(provider.connection, marketPDA);
  
  // Additional verification: try to find if there's an escrow account with the "wrong" address
  const wrongEscrowPDA = new PublicKey("FABXiVKzTeu4mfdCdSXfSGamdJ9iUuzdjR9svPcSrJ77");
  const wrongEscrowInfo = await provider.connection.getAccountInfo(wrongEscrowPDA);
  if (wrongEscrowInfo) {
    console.warn("⚠️ WARNING: Found an escrow account at the 'wrong' address:", wrongEscrowPDA.toBase58());
    console.warn("   This might indicate the market was created with a different market_id or derivation method.");
  }
  const positionPDA = getPositionPDA(provider.wallet.publicKey, marketPDA, positionTimestamp);

  console.log("🔍 PDAs:", {
    marketPDA: marketPDA.toBase58(),
    escrowPDA: escrowPDA.toBase58(),
    positionPDA: positionPDA.toBase58(),
  });

  // Verify position account exists
  const positionAccountInfo = await provider.connection.getAccountInfo(positionPDA);
  if (!positionAccountInfo) {
    throw new Error(`Position account not found: ${positionPDA.toBase58()}`);
  }
  
  // CRITICAL: Read the market PDA from the position account data
  // The position account stores position.market (Pubkey) at offset 32 (after discriminator + user Pubkey)
  // Position structure: discriminator(8) + user(32) + market(32) + ...
  const positionData = positionAccountInfo.data;
  if (positionData.length < 72) {
    throw new Error(`Position account data too short: ${positionData.length} bytes`);
  }
  
  // Extract market Pubkey from position account (offset 40: 8 discriminator + 32 user)
  const marketPubkeyFromPosition = new PublicKey(positionData.slice(40, 72));
  
  console.log("🔍 Market PDA from Position Account:", {
    derivedFromMarketId: marketPDA.toBase58(),
    fromPositionAccount: marketPubkeyFromPosition.toBase58(),
    match: marketPDA.equals(marketPubkeyFromPosition),
  });
  
  // Use the market PDA from the position account, not the one we derived
  // This is what Anchor will use when resolving the constraint
  const actualMarketPDA = marketPubkeyFromPosition;
  
  // If they don't match, this explains the error!
  if (!marketPDA.equals(actualMarketPDA)) {
    console.warn("⚠️ WARNING: Market PDA mismatch!");
    console.warn(`   Derived from market_id: ${marketPDA.toBase58()}`);
    console.warn(`   From position account: ${actualMarketPDA.toBase58()}`);
    console.warn(`   This means the position was created with a different market_id than expected.`);
  }
  
  // Derive escrow PDA using the ACTUAL market PDA from the position account
  const actualEscrowPDA = await getMarketEscrowPDAWithVerification(provider.connection, actualMarketPDA);
  
  console.log("🔍 Using Actual Market PDA for Escrow:", {
    marketPDA: actualMarketPDA.toBase58(),
    escrowPDA: actualEscrowPDA.toBase58(),
    previousEscrowPDA: escrowPDA.toBase58(),
    match: escrowPDA.equals(actualEscrowPDA),
  });

  // Discriminator for claim_payout - Anchor uses "global:<function_name>" format
  const discriminatorHash = require('crypto').createHash('sha256').update("global:claim_payout").digest();
  const discriminator = discriminatorHash.subarray(0, 8);

  // Use the actual market and escrow PDAs from the position account
  // This ensures they match what Anchor will derive when reading the position
  const finalMarketPDA = actualMarketPDA;
  const finalEscrowPDA = actualEscrowPDA;

  console.log("🔍 Final Instruction Accounts:", {
    market: finalMarketPDA.toBase58(),
    escrow: finalEscrowPDA.toBase58(),
    position: positionPDA.toBase58(),
    user: provider.wallet.publicKey.toBase58(),
  });

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: finalMarketPDA, isSigner: false, isWritable: true },           // market
      { pubkey: finalEscrowPDA, isSigner: false, isWritable: true },           // market_escrow
      { pubkey: positionPDA, isSigner: false, isWritable: true },              // position
      { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: true }, // user
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program (NEW)
    ],
    programId: ORACLE_PROGRAM_ID,
    data: discriminator as any,
  });

  // Log the actual instruction data
  console.log("🔍 Instruction Data:", {
    discriminator: Array.from(new Uint8Array(discriminator)).map((b: number) => b.toString(16).padStart(2, '0')).join(''),
    programId: ORACLE_PROGRAM_ID.toBase58(),
    keysCount: instruction.keys.length,
  });

  const tx = new Transaction().add(instruction);
  const signature = await provider.sendAndConfirm(tx);

  return { signature, positionPDA };
}