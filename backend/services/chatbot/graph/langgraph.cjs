// LangGraph - Agentic Chatbot Orchestrator
// STRICT PIPELINE:
// User Query → LeadAgent → RetrievalAgent → SkillGapAgent → RoadmapAgent → ResponseComposer

const { StateGraph, START, END, MemorySaver } = require("@langchain/langgraph");

// Import all agents required for the STRICT pipeline
const leadAgent = require('../agents/leadAgent.cjs');
const retrieverNode = require('../agents/retrieverNode.cjs');
const skillAgent = require('../agents/skillAgent.cjs');
const roadMapAgent = require('../agents/roadmapAgent.cjs');
const responseGenerator = require('../agents/responseGenerator.cjs');

/**
 * Define the graph state structure.
 */
const graphState = {
  threadId: { value: (x, y) => y ? y : x, default: () => null },
  resumeFilePath: { value: (x, y) => y ? y : x, default: () => null },
  userQuery: { value: (x, y) => y ? y : x, default: () => "" },
  userProfile: { value: (x, y) => y ? y : x, default: () => null },
  
  // Datasets for retriever
  datasets: { value: (x, y) => ["jobs", "skills", "courses", "gov_schemes"], default: () => ["jobs", "skills", "courses", "gov_schemes"] },
  
  // Context fields
  chatHistory: { value: (x, y) => y ? y : x, default: () => [] },
  semanticContext: { value: (x, y) => y ? y : x, default: () => [] },
  datasetContext: { value: (x, y) => y ? y : x, default: () => [] },
  userContext: { value: (x, y) => Object.keys(y || {}).length ? y : x, default: () => ({}) },
  userPreferences: { value: (x, y) => Object.keys(y || {}).length ? y : x, default: () => ({}) },
  
  isGeneralQuery: { value: (x, y) => (y !== undefined ? y : x), default: () => false },
  conversationalIntro: { value: (x, y) => y ? y : x, default: () => "" },
  retrievedData: { value: (x, y) => y ? { ...x, ...y } : x, default: () => ({}) },
  data: { value: (x, y) => ({ ...x, ...y }), default: () => ({}) },
  finalResponse: { value: (x, y) => y ? { ...x, ...y } : x, default: () => ({}) },
  conversationalResponse: { value: (x, y) => y ? y : x, default: () => "" }
};

// Create the LangGraph state graph
const workflow = new StateGraph({
  channels: graphState
});

// Add nodes
workflow.addNode("leadAgent", leadAgent);
workflow.addNode("retrieverNode", retrieverNode);
workflow.addNode("skillAgent", skillAgent);
workflow.addNode("roadMapAgent", roadMapAgent);
workflow.addNode("responseComposer", responseGenerator);

// ═══════════════════════════════════════════════════════════════════════════════
// Define the STRICT workflow edges (Execution pipeline)
// ═══════════════════════════════════════════════════════════════════════════════

workflow.addEdge(START, "leadAgent");

workflow.addConditionalEdges("leadAgent",
  (state) => state.isGeneralQuery ? END : "retrieverNode"
);

workflow.addEdge("retrieverNode", "skillAgent");
workflow.addEdge("skillAgent", "roadMapAgent");
workflow.addEdge("roadMapAgent", "responseComposer");
workflow.addEdge("responseComposer", END);

// Compile the graph into an executable format with conversational memory
const checkpointer = new MemorySaver();
const app = workflow.compile({ checkpointer });

module.exports = app;
