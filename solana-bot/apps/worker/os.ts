import { prismaClient } from "db/client";

// const BASE_WORKER_DIR = process.env.BASE_WORKER_DIR || `/Users/pritam/Documents/Projects/SolanaCodeEditor/solana-bot/apps/code-server/temp/bolty-worker`
const BASE_WORKER_DIR = process.env.BASE_WORKER_DIR || `http://localhost:8080/?folder=/home/coder/project`

if(!Bun.file(BASE_WORKER_DIR).exists()){
    Bun.write(BASE_WORKER_DIR, "")
}

export async function onFileUpdate(filePath:string, fileContent:string,  projectId:string, promptId:string){
    await prismaClient.action.create({
        data: {
            projectId,
            promptId,
            content: `Updated file ${filePath}`
        },
    });

    console.log(`Writing file: ${filePath}`)
    await Bun.write(`${BASE_WORKER_DIR}/${filePath}`, fileContent);
}

export async function onShellCommand(shellCommand:string, projectId:string, promptId:string){
    const commands = shellCommand.split("&&");
    for(const command of commands){
        console.log(`Running command: ${command}`);
        const result = Bun.spawnSync({cmd:command.split(" "), cwd:BASE_WORKER_DIR})
        console.log(result.stdout);
        console.log(result.stderr);

        await prismaClient.action.create({
            data: {
                projectId,
                promptId,
                content: `Ran command: ${command}`,
            },
        });
    }
}