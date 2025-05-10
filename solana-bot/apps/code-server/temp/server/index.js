import express from "express";
import cors from "cors";
import { Connection, clusterApiUrl, Keypair } from '@solana/web3.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const app = express();
app.use(cors());
app.use(express.json());

const execAsync = promisify(exec);

const NETWORKS = {
    devnet: clusterApiUrl('devnet'),
    testnet: clusterApiUrl('testnet'),
    mainnet: clusterApiUrl('mainnet-beta')
};

const execPromise = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error);
      } else {
        resolve(stdout);
      }
    });
  });

app.get('/programId', async (req, res) => {
    const { network = 'devnet' } = req.query ;
    
    if (!NETWORKS[network]) {
        return res.status(400).json({ error: 'Invalid network specified' });
    }

    try {
        console.log("Getting the contract solana_program.so");
        const filePathSO = `../project/target/deploy/solana_program.so`;
        const filePathKeyPair = `../project/target/deploy/solana_program-keypair.json`;

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
            programBinary: fileKeypair, 
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
    const { network = 'devnet' } = req.body;

    if (!NETWORKS[network]) {
      return res.status(400).json({ error: 'Invalid network specified' });
    }

    try {
      await execAsync("solana address");
    } catch (error) {
      return res.status(400).json({ message: "No wallet found. Run 'solana-keygen new' or configure one." });
    }

    const filePathSO = `../project/target/deploy/solana_program.so`;
    const filePathKeyPair = `../project/target/deploy/solana_program-keypair.json`;

    if (!fs.existsSync(filePathSO) || !fs.existsSync(filePathKeyPair)) {
      return res.status(400).json({ error: 'Program build artifacts not found' });
    }

    let { stdout: balanceOutput } = await execAsync("solana balance");
    const solBalance = parseFloat(balanceOutput.trim());

    if (solBalance < 1) {
      console.log(`Balance low (${solBalance} SOL). Requesting airdrop...`);
      await execAsync("solana airdrop 5");
    }

    const deployCommand = `solana program deploy ${filePathSO} --keypair ${filePathKeyPair} --url ${NETWORKS[network]}`;
    console.log('Deploying program...');

    const { stdout: deployOutput, stderr } = await execAsync(deployCommand);

    if (stderr) console.error('stderr:', stderr);

    const programIdMatch = deployOutput.match(/Program Id: (\w+)/);
    const deployedProgramId = programIdMatch ? programIdMatch[1] : null;

    if (!deployedProgramId) {
      return res.status(500).json({ error: 'Failed to extract Program ID' });
    }

    res.json({
      success: true,
      transactionLog: deployOutput,
      programId: deployedProgramId,
      message: `Program deployed to ${network}`
    });

  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({ error: 'Failed to deploy program' });
  }
});

app.get('/download-project', async (req, res) => {
  const folderPath = path.resolve('../project'); // Absolute path is safer
  const zipName = req.query.name || 'project.zip'; // You can pass `?name=myproject.zip`

  console.log("Creating ZIP file:", zipName);

  res.setHeader('Content-Disposition', `attachment; filename=${zipName}`);
  res.setHeader('Content-Type', 'application/zip');

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);

  // Add all files except node_modules
  archive.glob('**/*', {
    cwd: folderPath,
    ignore: ['node_modules/**']
  });

  archive.finalize();
});



app.post("/create-wallet", async (req, res) => {
  console.log("creatig wallet")
  const keypairPath = "./my-keypair.json";

  // Check if the keypair file exists
  if (fs.existsSync(keypairPath)) {
    let keypairFile = fs.readFileSync(keypairPath);
    return res.json({ keypair: keypairFile });
  }

  // Generate a new keypair
  const cmd = "solana-keygen new --outfile ./my-keypair.json --force --no-bip39-passphrase";
  try {
    const strout = await execPromise(cmd); // Wait for keypair generation to complete
    let keypairFile = fs.readFileSync(keypairPath);
    if (keypairFile) {
      return res.json({ keypair: keypairFile});
    }
    return res.json({ message: `Keypair generated successfully: ${strout}` });
  } catch (error) {
    return res.status(500).json({ error: `Error: ${error}` });
  }
});
app.get('/keypair', async (req, res) => {
  try {
    const filePath = path.resolve('./my-keypair.json'); 
    const zipName = req.query.name || 'keypair.zip';

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Keypair file not found' });
    }

    console.log("Creating ZIP file:", zipName);

    res.setHeader('Content-Disposition', `attachment; filename=${zipName}`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    // Add the keypair file to the ZIP
    archive.file(filePath, { name: 'my-keypair.json' });

    await archive.finalize(); // Wait for completion

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `${error}` });
  }
});

app.listen(3001, ()=>{
  console.log("server started at 3001")
})