import { AutoScalingClient, DescribeAutoScalingInstancesCommand, SetDesiredCapacityCommand  } from "@aws-sdk/client-auto-scaling";
import express from "express"
import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2";

const client = new AutoScalingClient({region:"ap-south-1", credentials:{
    accessKeyId:process.env.AWS_ACCESS_KEY!,
    secretAccessKey:process.env.AWS_ACCESS_SECRET!
}})

const es2Client = new EC2Client({region:"ap-south-1", credentials:{
    accessKeyId:process.env.AWS_ACCESS_KEY!,
    secretAccessKey:process.env.AWS_ACCESS_SECRET!
}})
const app = express()

type Machine = {
    ip:string,
    isUsed:boolean,
    assignedProject?:string
}

const ALL_MACHINCES: Machine[] = [];

async function refershInstance(){
    const command = new DescribeAutoScalingInstancesCommand();
    const data = await client.send(command)
    
    const ec2InstanceCommand = new DescribeInstancesCommand({
        InstanceIds: data.AutoScalingInstances?.map(x => x.InstanceId).filter((id): id is string => id !== undefined)
    })
    const ec2response = await es2Client.send(ec2InstanceCommand)
    if (ec2response?.Reservations?.[0]?.Instances?.[0]?.PublicDnsName) {
        console.log(JSON.stringify(ec2response.Reservations[0].Instances[0].PublicDnsName))
    } else {
        console.log('No instance found or missing DNS name')
    }
}

refershInstance()

setInterval(()=>{
    refershInstance()
}, 10*1000)

app.get("/:projectId", (req, res)=>{
    res.send("Hello world!");
})

app.listen(9092)