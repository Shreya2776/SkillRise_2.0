const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));
app.use(express.json());

// Routes
const chatbotRoutes = require('./routes/chatbot.routes');
app.use('/api/chatbot', chatbotRoutes);

// Chat history preview endpoint
const ChatThread = require('../agentic-chatbot/models/ChatThread');
const ChatMessage = require('../agentic-chatbot/models/ChatMessage');
app.get('/api/chatbot/history/preview', async (req, res) => {
  try {
    const userId = req.query.userId || 'anonymous-user';
    const thread = await ChatThread.findOne({ userId }).sort({ updatedAt: -1 });
    if (!thread) return res.json({ success: true, preview: null });
    const messages = await ChatMessage.find({ threadId: thread._id }).sort({ createdAt: -1 }).limit(2);
    res.json({ success: true, preview: { threadId: thread._id, title: thread.title, messages: messages.reverse(), updatedAt: thread.updatedAt } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/agentic-chatbot";

// MongoDB Connection and Server Start
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB`);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`MongoDB connection error:`, err);
  });
