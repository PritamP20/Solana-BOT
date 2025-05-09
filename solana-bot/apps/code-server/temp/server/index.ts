import express from "express";
import  type { Request, Response } from "express";
import cors from "cors";
import { Connection, clusterApiUrl, Keypair } from '@solana/web3.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const execAsync = promisify(exec);

const NETWORKS = {
    devnet: clusterApiUrl('devnet'),
    testnet: clusterApiUrl('testnet'),
    mainnet: clusterApiUrl('mainnet-beta')
};

app.get('/', async (req: Request, res: Response) => {
    const { network = 'devnet' } = req.query as { network?: keyof typeof NETWORKS };
    
    if (!NETWORKS[network]) {
        return res.status(400).json({ error: 'Invalid network specified' });
    }

    try {
        console.log("Getting the contract solana_program.so");
        const filePathSO = `../bolty-worker/target/deploy/solana_program.so`;
        const filePathKeyPair = `../bolty-worker/target/deploy/solana_program-keypair.json`;

        if (!fs.existsSync(filePathSO) || !fs.existsSync(filePathKeyPair)) {
            await execAsync(`cargo build-sbf --manifest-path ./project/Cargo.toml`);
        }
        
        if (!fs.existsSync(filePathSO) || !fs.existsSync(filePathKeyPair)) {
            return res.status(500).json({ error: 'Failed to build the contract' });
        }

        const fileKeypair = await fs.promises.readFile(filePathKeyPair, 'utf-8');
        const keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fileKeypair)));
        const programId = keypair.publicKey.toString();
        console.log("Program ID:", programId);

        res.json({
            success: true,
            programBinary: fileKeypair, // Remove .toString() as fileKeypair is already a string
            programId: programId,
            network
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to get the contract' });
    }
});


app.post('/finalize-deployment', async (req, res) => {
    try {
      const { signedTransaction, network = 'devnet' } = req.body as {
        signedTransaction: string;
        network?: keyof typeof NETWORKS;
      };
      
      if (!Object.keys(NETWORKS).includes(network)) {
        return res.status(400).json({ error: 'Invalid network specified' });
      }

      const connection = new Connection(NETWORKS[network], 'confirmed');
      
      const txid = await connection.sendRawTransaction(
        Buffer.from(signedTransaction, 'base64')
      );
      
      await connection.confirmTransaction(txid);
      
      res.json({
        success: true,
        transactionId: txid,
        message: `Contract deployed successfully to ${network}`
      });
    } catch (error) {
      console.error('Deployment finalization error:', error);
      res.status(500).json({ error: 'Failed to finalize deployment' });
    }
  });
  

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});