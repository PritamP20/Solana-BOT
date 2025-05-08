import {prismaClient} from "db/client"
import express, { response } from "express"
import cors from "cors"
import { authMiddleware } from "./middleware";
import e from "express";

const app = express();
app.use(cors())
app.use(express.json())
app.use(authMiddleware);

app.post("/project", authMiddleware, async(req, res)=>{
    const {prompt, email, type} = req.body;

    const userId=  req.userId;

    const user = await prismaClient.user.findFirst({
        where:{
            email: email
        }
    })

    if(!user){
        await prismaClient.user.create({
            data:{
                id: userId,
                email:email
            }
        })
    }

    try {

        const description = prompt.split("\n")[0];

        const response = await prismaClient.project.create({
            data:{description, userId, type}
        })
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

app.get("/prompts/:projectId",  async(req, res)=>{

    const projectId =  req.params.projectId;
    try {
        const resposnseI = await prismaClient.prompt.findMany({
            where:{projectId:"ae0e8a46-115c-4519-8454-eb3d0033674f"}
        })
        console.log(resposnseI)
        res.json({prompts: resposnseI})
    } catch (error) {
        res.json({error: error})
    }
    console.log("working")
    res.json({msg:"wprkgin"})
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