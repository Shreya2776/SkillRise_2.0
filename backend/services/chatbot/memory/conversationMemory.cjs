const ChatThread = require('../../../shared/models/ChatThread.js').default;
const ChatMessage = require('../../../shared/models/ChatMessage.js').default;

/**
 * Creates a new chat thread for a user.
 */
async function createThread(userId) {
  try {
    const thread = new ChatThread({ userId });
    await thread.save();
    return thread;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

/**
 * Adds a new message to an existing thread.
 */
async function addMessage(threadId, role, content, embeddingId = null) {
  try {
    const message = new ChatMessage({
      threadId,
      role,
      content,
      embeddingId
    });
    await message.save();
    
    // Update the thread's timestamp
    await updateThreadTimestamp(threadId);
    
    return message;
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
}

/**
 * Retrieves the message history for a thread (limited to last 20 messages).
 */
async function getThreadMessages(threadId, limit = 20) {
  try {
    // Sort descending by creation date so we get the newest ones
    const messages = await ChatMessage.find({ threadId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    
    // Reverse to chronological order (oldest first in the array)
    return messages.reverse();
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

/**
 * Gets all threads for a particular user.
 */
async function getUserThreads(userId) {
  try {
    return await ChatThread.find({ userId })
      .sort({ updatedAt: -1 })
      .exec();
  } catch (error) {
    console.error("Error fetching user threads:", error);
    return [];
  }
}

/**
 * Updates the updatedAt timestamp on the thread.
 */
async function updateThreadTimestamp(threadId) {
  try {
    await ChatThread.findByIdAndUpdate(threadId, { updatedAt: Date.now() });
  } catch (error) {
    console.error("Error updating thread timestamp:", error);
  }
}

module.exports = {
  createThread,
  addMessage,
  getThreadMessages,
  getUserThreads,
  updateThreadTimestamp
};
