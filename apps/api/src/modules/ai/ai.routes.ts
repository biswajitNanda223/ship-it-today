import type { FastifyInstance } from "fastify";

type InferenceBody={prompt:string;model?:"fast"|"quality";useRag?:boolean;maxTokens?:number};
export async function aiRoutes(app:FastifyInstance){
  app.post<{Body:InferenceBody}>("/ai/inference",{schema:{body:{type:"object",required:["prompt"],properties:{prompt:{type:"string",minLength:1,maxLength:4000},model:{type:"string",enum:["fast","quality"]},useRag:{type:"boolean"},maxTokens:{type:"integer",minimum:16,maximum:4096}}}}},async request=>{
    const {prompt,model="fast",useRag=true,maxTokens=512}=request.body;
    const inputTokens=Math.ceil(prompt.length/4);const retrievedChunks=useRag?4:0;
    return {data:{requestId:request.id,route:model,stream:true,inputTokens,maxTokens,retrievedChunks,estimatedLatencyMs:(model==="fast"?420:980)+(useRag?85:0),estimatedCostUsd:Number(((inputTokens+maxTokens)*.000002).toFixed(5)),safety:"passed"}};
  });
}
