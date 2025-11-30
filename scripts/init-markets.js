const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');

const PROGRAM_ID = new PublicKey('BhCVTNcTnrzRxZSayuX3kYBJZ36mUk5VB7C7k6uuhpDj');

const markets = [
  {
    id: 'eth-etf-q4-2025',
    question: 'Will an Ethereum Spot ETF be approved by December 31, 2025?',
    endTime: Math.floor(new Date('2025-12-31').getTime() / 1000),
  },
  {
    id: 'solana-100usd-jul2026',
    question: 'Will Solana (SOL) trade above $100 at any time before July 1, 2026?',
    endTime: Math.floor(new Date('2026-07-01').getTime() / 1000),
  },
  {
    id: 'ai-100m-users-2026',
    question: 'Will any AI agent platform surpass 100 million monthly active users by June 30, 2026?',
    endTime: Math.floor(new Date('2026-06-30').getTime() / 1000),
  }
];

async function createMarket(connection, payer, market) {
  const [marketPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('market'), Buffer.from(market.id)],
    PROGRAM_ID
  );

  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('market_escrow'), marketPDA.toBuffer()],
    PROGRAM_ID
  );

  const discriminator = Buffer.from([103, 226, 97, 235, 200, 188, 251, 254]);
  const marketIdBytes = Buffer.from(market.id);
  const questionBytes = Buffer.from(market.question);
  
  const marketIdLen = Buffer.alloc(4);
  marketIdLen.writeUInt32LE(marketIdBytes.length);
  
  const questionLen = Buffer.alloc(4);
  questionLen.writeUInt32LE(questionBytes.length);
  
  const endTimeBuffer = Buffer.alloc(8);
  endTimeBuffer.writeBigInt64LE(BigInt(market.endTime));

  const data = Buffer.concat([
    discriminator,
    marketIdLen,
    marketIdBytes,
    questionLen,
    questionBytes,
    endTimeBuffer,
  ]);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: marketPDA, isSigner: false, isWritable: true },
      { pubkey: escrowPDA, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });

  const tx = new Transaction().add(instruction);
  const signature = await connection.sendTransaction(tx, [payer]);
  await connection.confirmTransaction(signature);

  return { signature, marketPDA, escrowPDA };
}

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  const secretKey = JSON.parse(
    fs.readFileSync('/Users/NiggaAutomation/.config/solana/id.json', 'utf-8')
  );
  const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));

  console.log('Wallet:', payer.publicKey.toBase58());
  console.log('Balance:', (await connection.getBalance(payer.publicKey)) / 1e9, 'SOL\n');

  for (const market of markets) {
    try {
      console.log(`Creating market: ${market.id}...`);
      const result = await createMarket(connection, payer, market);
      console.log('✅ Success!');
      console.log('   Signature:', result.signature);
      console.log('   Market PDA:', result.marketPDA.toBase58());
      console.log('   Escrow PDA:', result.escrowPDA.toBase58());
      console.log('');
    } catch (err) {
      console.error('❌ Failed:', err.message);
    }
  }
}

main();
