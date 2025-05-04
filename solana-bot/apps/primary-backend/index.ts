import {prismaClient} from "db/client"
import express from "express"
import cors from "cors"
import { authMiddleware } from "./middleware";
import e from "express";

const app = express();
app.use(cors())
app.use(express.json())

app.post("/project", authMiddleware, async(req, res)=>{
    const {prompt, type} = req.body;
    try {
        const userId=  req.userId;

        const description = prompt.split("\n")[0];

        const response = await prismaClient.project.create({
            data:{description, userId, type}
        })
    console.log("projectID: ",response.id)
    res.json({projectId: response.id})
    } catch (error) {
        res.json({error:error})
    }
}) 


app.get("/projects", authMiddleware, async(req, res)=>{
    const userId = req.userId;
    const project = await prismaClient.project.findMany({
        where:{userId:userId}
    })
    res.json({project})
})

app.get("/prompts/:projectId",authMiddleware,  async(req, res)=>{
    const userId = req.userId;
    const projectId = req.params.projectId;
    const prompts = await prismaClient.prompt.findMany({
        where:{projectId},
        include:{
            actions:true
        }
    })
    res.json({prompts})
})

app.post("/actions",authMiddleware, async(req, res)=>{
    const {projectId, content, promptId} = req.body();
    try {
        await prismaClient.action.create({
            data: {
                projectId,
                content,
                promptId
            }
        })
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

app.get("/actions/:projectId", authMiddleware, async (req, res) => {
    const userId = req.userId!;
    const projectId = req.params.projectId;
  
    const actions = await prismaClient.action.findMany({
      where: { projectId },
    });
    res.json({ actions });
  });

app.listen(8082, ()=>{
    console.log("Server is runnning on the port 8082")
})