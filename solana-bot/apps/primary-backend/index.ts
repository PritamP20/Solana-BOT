import { prismaClient } from "db/client";
import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/project", authMiddleware, async (req, res) => {
    const { prompt, email, type } = req.body;
    const userId = req.userId;

    const user = await prismaClient.user.findFirst({
        where: {
            email: email,
        },
    });

    if (!user) {
        await prismaClient.user.create({
            data: {
                id: userId,
                email: email,
            },
        });
    }

    try {
        const description = prompt.split("\n")[0];
        const response = await prismaClient.project.create({
            data: { description, userId, type }
        });
        res.json({ projectId: response.id });
    } catch (error) {
        res.json({ error: error });
    }
});

app.get("/projects", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const project = await prismaClient.project.findMany({
        where: { userId: userId }
    });
    res.json({ project });
});

app.get("/prompts/:projectId", async (req, res) => {
    const projectId = req.params.projectId;
    try {
        const responseI = await prismaClient.prompt.findMany({
            where: { projectId: projectId }
        });
        console.log(responseI);
        res.json({ prompts: responseI });
    } catch (error) {
        res.json({ error: error });
    }
});

app.post("/actions", authMiddleware, async (req, res) => {
    const { projectId, content, promptId } = req.body;
    try {
        await prismaClient.action.create({
            data: {
                projectId,
                content,
                promptId
            }
        });
        res.status(200).json({ msg: "Action created" });
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

app.get("/actions/:projectId", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const projectId = req.params.projectId;

    const actions = await prismaClient.action.findMany({
        where: { projectId },
    });
    res.json({ actions });
});

app.post("/extention", (req, res) => {
    console.log("working");
    const body = req.body
    console.log(body)
    res.json({ msg: "working" });
});

app.listen(8082, () => {
    console.log("Server is running on port 8082");
});