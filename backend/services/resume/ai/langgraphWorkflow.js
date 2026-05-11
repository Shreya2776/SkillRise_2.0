import { StateGraph } from "langgraph";

export function buildGraph(){

 const graph = new StateGraph();

 graph.addNode("understandResume", async(state)=>{
   return {resumeText:state.resumeText};
 });

 graph.addNode("extractSkills", async(state)=>{
   const skills = await extractSkills(state.resumeText);
   return {skills};
 });

 graph.addNode("atsScore", async(state)=>{
   const score = calculateATS(state.skills,state.jobSkills);
   return {score};
 });

 graph.addNode("suggestions", async(state)=>{
   const tips = await generateSuggestions(state.resumeText,state.jobDescription);
   return {tips};
 });

 graph.addEdge("understandResume","extractSkills");
 graph.addEdge("extractSkills","atsScore");
 graph.addEdge("atsScore","suggestions");

 return graph.compile();
}