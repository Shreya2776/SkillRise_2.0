// Chatbot Controller
// Handles incoming requests securely to coordinate memory and graph execution
// UPGRADED: Integrates Hybrid Memory System (getUserMemory → personalizeContext → graph → updateUserMemory)

const { createThread, saveMessage, getRelevantContext } = require('../../agentic-chatbot/memory/memoryManager');
const { getUserMemory, updateUserMemory, personalizeContext } = require('../../agentic-chatbot/memory/memoryEngine');
const app = require('../../agentic-chatbot/graph/langgraph'); // The compiled StateGraph

const handleMessage = async (req, res) => {
  try {
    const { message, threadId: incomingThreadId, userId, userProfile } = req.body;

    let messageText = message;
    if (!messageText && req.file) {
      messageText = "I have uploaded my resume.";
    }

    if (!messageText && !req.file) {
      return res.status(400).json({ error: "Message or resume file is required." });
    }

    // 1. Thread Management
    let threadId = incomingThreadId;
    if (!threadId) {
      // Typically require userId in production to map threads; using IP or dummy if missing during dev
      const uid = userId || "anonymous-user";
      const { createThread } = require('../../agentic-chatbot/memory/conversationMemory');
      const newThread = await createThread(uid);
      threadId = newThread._id.toString();
    }

    // 2. Save User Message into Hybrid Memory (MongoDB + Pinecone via async)
    await saveMessage(threadId, "user", messageText);

    // 3. Fetch Hybrid Context (Short-term chat history + Semantic long-term overlaps)
    const context = await getRelevantContext(threadId, messageText);

    // ─── 3.5 Hybrid Memory: Fetch user memory + personalize ─────────────────
    const uid = userId || "anonymous-user";
    const userMemory = await getUserMemory(uid);
    const { enhancedQuery, userPreferences } = personalizeContext(messageText, userMemory);

    console.log(`[ChatbotRoute] Enhanced query: "${enhancedQuery.slice(0, 100)}..."`);

    // 4. Initialize LangGraph State
    const initialState = {
      threadId,
      userQuery: enhancedQuery,          // Use personalized query
      userProfile: userProfile || null,
      chatHistory: context.recentMessages || [],
      semanticContext: context.semanticMatches || [],
      datasetContext: context.datasetMatches || [],
      resumeFilePath: req.file ? req.file.path : null,
      datasets: ["jobs", "skills", "courses", "gov_schemes"], // Enforce all datasets for retriever
      retrievedData: {},
      // Inject user memory preferences into state for agents to consume
      userPreferences: userPreferences || {}
    };

    console.log(`[ChatbotRoute] Invoking Agentic Graph for Thread ${threadId}...`);

    // Setup Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); 

    // 5. Execute Multi-Agent Graph Orchestration with Streaming
    let finalState = initialState;

    for await (const chunk of await app.stream(initialState, { configurable: { thread_id: threadId } })) {
      const nodeName = Object.keys(chunk)[0];
      const nodeData = chunk[nodeName];
      
      finalState = { ...finalState, ...nodeData };

      let message = `Agent evaluating...`;
      if (nodeName === 'router') message = `Router selected: ${nodeData.selectedAgents?.join(', ') || 'none'}`;
      else if (nodeName === 'retrieverNode') message = `Retrieving relevant data from knowledge base...`;
      else if (nodeName === 'aggregator') message = `Synthesizing analyzed data...`;
      else if (nodeName === 'responseGenerator') message = `Generating conversational response...`;
      else if (nodeName !== '__start__') message = `Running ${nodeName}...`;

      res.write(`data: ${JSON.stringify({ type: 'progress', message, nodeName })}\n\n`);
    }

    // 6. Save Assistant Response back to Hybrid Memory
    const finalAnswer = finalState.conversationalResponse || "Sorry, I couldn't formulate a response right now.";
    await saveMessage(threadId, "assistant", finalAnswer);

    // ─── 6.5 Hybrid Memory: Update user memory asynchronously ───────────────
    // Fire-and-forget to avoid delaying the response
    updateUserMemory(uid, messageText, finalState.finalResponse || {})
      .then(() => console.log(`[ChatbotRoute] User memory updated for ${uid}`))
      .catch(err => console.error(`[ChatbotRoute] Memory update failed: ${err.message}`));

    // 7. Send final standard payload to Frontend
    res.write(`data: ${JSON.stringify({ 
      type: 'complete',
      reply: finalAnswer,
      threadId: threadId,
      agentData: finalState.finalResponse
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('[ChatbotRoute] Error handling message:', error);
    res.status(500).json({ error: 'Internal server error while processing AI graphs', details: error.stack || error.message || String(error) });
  }
};

module.exports = {
  handleMessage,
};
