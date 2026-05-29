import "dotenv/config";
import mongoose from "mongoose";
import User from "../shared/models/User.js";
import Profile from "../shared/models/Profile.js";
import Resume from "../shared/models/Resume.js";
import Interview from "../shared/models/Interview.js";
import Progress from "../shared/models/Progress.js";
import ChatThread from "../shared/models/ChatThread.js";
import ChatMessage from "../shared/models/ChatMessage.js";
import Blog from "../shared/models/Blog.js";
import Opportunity from "../shared/models/Opportunity.js";
import Program from "../shared/models/Program.js";

async function inspectUser() {
  const email = "shikayatseva@gmail.com";
  console.log(`Connecting to MongoDB for email: ${email}...`);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully! Fetching user...");

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User with email ${email} not found in the database.`);
      mongoose.connection.close();
      return;
    }

    console.log("\n=================== USER DETAILS ===================");
    console.log(JSON.stringify(user, null, 2));

    const userId = user._id;

    // Fetch Profile
    const profile = await Profile.findOne({ user: userId });
    console.log("\n=================== USER PROFILE ===================");
    console.log(profile ? JSON.stringify(profile, null, 2) : "No profile found.");

    // Fetch Resumes
    const resumes = await Resume.find({ userId });
    console.log("\n=================== USER RESUMES ===================");
    console.log(resumes && resumes.length > 0 ? JSON.stringify(resumes, null, 2) : "No resumes found.");

    // Fetch Interviews
    const interviews = await Interview.find({ userId });
    console.log("\n=================== USER MOCK INTERVIEWS ===================");
    console.log(interviews && interviews.length > 0 ? JSON.stringify(interviews, null, 2) : "No interviews found.");

    // Fetch Progress
    const progress = await Progress.find({ user: userId });
    console.log("\n=================== USER PROGRESS ===================");
    console.log(progress && progress.length > 0 ? JSON.stringify(progress, null, 2) : "No progress found.");

    // Fetch Chat Threads & Messages
    const chatThreads = await ChatThread.find({ userId });
    console.log("\n=================== USER CHAT THREADS ===================");
    if (chatThreads && chatThreads.length > 0) {
      console.log(`Found ${chatThreads.length} chat threads.`);
      for (const thread of chatThreads) {
        console.log(`\nThread ID: ${thread._id}, Title: ${thread.title || 'Untitled'}`);
        const messages = await ChatMessage.find({ threadId: thread._id });
        console.log(`Messages count: ${messages.length}`);
        if (messages.length > 0) {
          console.log(JSON.stringify(messages.slice(0, 5), null, 2)); // show first 5 messages
          if (messages.length > 5) console.log(`... and ${messages.length - 5} more messages.`);
        }
      }
    } else {
      console.log("No chat threads found.");
    }

    // Check if user is associated with any NGO blogs or opportunities or programs
    // (NGO roles can publish blogs, opportunities, programs)
    if (user.role === "ngo") {
      const blogs = await Blog.find({ author: userId });
      const opportunities = await Opportunity.find({ ngo: userId });
      const programs = await Program.find({ ngoId: userId });
      
      console.log("\n=================== NGO CONTRIBUTIONS ===================");
      console.log(`Blogs published: ${blogs.length}`);
      console.log(`Opportunities published: ${opportunities.length}`);
      console.log(`Programs published: ${programs.length}`);
      
      if (blogs.length > 0) console.log("Blogs:", JSON.stringify(blogs, null, 2));
      if (opportunities.length > 0) console.log("Opportunities:", JSON.stringify(opportunities, null, 2));
      if (programs.length > 0) console.log("Programs:", JSON.stringify(programs, null, 2));
    }

    mongoose.connection.close();
    console.log("\nInspection complete! Connection closed.");
  } catch (error) {
    console.error("Error during inspection:", error);
    if (mongoose.connection) mongoose.connection.close();
  }
}

inspectUser();
