





// console.log(result.text);

import cors from "cors"
import express from "express"
import {prismaClient} from "db/client"
import { createPerplexity } from '@ai-sdk/perplexity';
import { generateText, type CoreMessage } from 'ai';
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./praser";
import { onFileUpdate, onShellCommand } from "./os";

const app = express();
app.use(cors())
app.use(express.json());

// import { GoogleGenAI,  } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: "AIzaSyCoD0gAoM-AIqKP4Wem0VMB6jBD-g13vyk" });


app.post("/prompt", async (req, res)=>{
    const {prompt, projectId}=req.body;
    
    const perplexity = createPerplexity({
        apiKey: "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",
    });

    const promptDb = await prismaClient.prompt.create({
        data:{
            content:prompt,
            projectId,
            type:"USER"
        }
    })

    const allPrompts = await prismaClient.prompt.findMany({
        where:{
            projectId:projectId
        },
        orderBy:{
            createdAt:"asc"
        }
    })

    const formattedPrompts: CoreMessage[] = allPrompts
  .map((p: any) => ({
    role: p.type === "USER" ? "user" : "assistant", // only "user" or "assistant"
    content: p.content,
  }))
  .filter((msg, idx, arr) => {
    if (idx === 0) return msg.role === "user"; // must start with user
    return msg.role !== arr[idx - 1].role; // ensure alternation
  }) as CoreMessage[];


    let artifactProcessor = new ArtifactProcessor("", (fileContent, filePath)=>onFileUpdate(fileContent, filePath, projectId, promptDb.id), (shellCommand)=>onShellCommand(shellCommand, projectId, promptDb.id));
    let artifact = "";
    // const response = await generateText({
    //     model: perplexity('sonar'),
    //     messages: allPrompts.map((p: any) => ({
    //       role: p.type === "USER" ? "user" : "assistant",
    //       content: p.content
    //     })),
    //     system: systemPrompt("SOLANA"),
    //     maxTokens: 8000,
    //   })

    //perpelxity code
    const response = await generateText({
        model: perplexity('sonar'),
        messages: formattedPrompts,
        system: systemPrompt("SOLANA"),
        maxTokens: 8000,
      });

    // const response = generateGeminiText()
      
    
    artifactProcessor.append(response.text);
    artifactProcessor.parse();
    artifact += response.text;

    
    // const response = await ai.models.generateContent({
    //   model: "gemini-2.0-flash", 
    //   contents: formattedPrompts
    // });
    
    // // Debug the response
    // console.log('Response:', response);
    
    // // Extract the text
    // const responseText = response.text || '';
    // console.log('Response Text:', responseText);
    
    // // Process and append the response
    // artifactProcessor.append(responseText);
    // artifactProcessor.parse();
    // artifact += responseText;
    

    const finalPrompt = await prismaClient.prompt.create({
        data: {
          content: artifact,
          projectId,
          type: "SYSTEM",
        },
    });

    await prismaClient.action.create({
        data: {
          projectId,
          content:"DONE",
          promptId:finalPrompt.id
        },
    });
      

})

app.listen(9091, ()=>{
    console.log("Worker server started at 9091")
})