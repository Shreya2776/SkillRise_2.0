import mongoose from "mongoose";
import dotenv from "dotenv";
import Opportunity from "./src/models/opportunity.model.js";
import User from "./src/models/User.js";

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find an NGO user
  const ngo = await User.findOne({ role: "ngo" });
  if (!ngo) {
    console.log("No NGO user found to assign these opportunities to.");
    process.exit(1);
  }

  const opportunities = [
    {
      title: "Fullstack Web Developer (NGO Impact)",
      description: "Build platforms for connecting donors and beneficiaries. Working with React and Node.js.",
      type: "job",
      skills: ["React", "Node.js", "MongoDB", "Express"],
      tags: ["technology", "healthcare"],
      location: "Remote",
      createdBy: ngo._id
    },
    {
      title: "Data Science Training Program",
      description: "Learn basic data analysis to help NGOs track their impact. Training in Python and Excel.",
      type: "training",
      skills: ["Python", "Excel", "Data Analysis"],
      tags: ["education", "skills"],
      location: "Bangalore (On-site)",
      createdBy: ngo._id
    },
    {
      title: "Community Outreach Coordinator",
      description: "Help us reach rural communities for healthcare awareness. Good communication and planning skills required.",
      type: "job",
      skills: ["Communication", "Planning", "Local Language"],
      tags: ["healthcare", "outreach"],
      location: "Patna, Bihar",
      createdBy: ngo._id
    },
    {
      title: "UI/UX Design for Social Good",
      description: "Create accessible designs for our community mobile app. Proficiency in Figma or Adobe XD.",
      type: "job",
      skills: ["Figma", "UI/UX", "Accessibility"],
      tags: ["design", "technology"],
      location: "Remote",
      createdBy: ngo._id
    },
    {
      title: "Digital Marketing Basics (Certification)",
      description: "A fast-paced training program to learn NGO branding and social media marketing.",
      type: "training",
      skills: ["Social Media", "SEO", "Content Writing"],
      tags: ["marketing", "education"],
      location: "Online",
      createdBy: ngo._id
    },
    {
      title: "Cloud Computing Intro for NGOs",
      description: "Master AWS/GCP basics to help organizations scale their data infrastructure.",
      type: "training",
      skills: ["AWS", "Google Cloud", "Compute Basics"],
      tags: ["technology", "cloud"],
      location: "Hybrid (Delhi)",
      createdBy: ngo._id
    },
    {
      title: "Grant Writer & Researcher",
      description: "Conduct research on domestic and international grants and write persuasive proposals.",
      type: "job",
      skills: ["Writing", "Research", "Project Management"],
      tags: ["fundraising", "admin"],
      location: "Mumbai",
      createdBy: ngo._id
    },
    {
      title: "React Native Mobile Dev Intern",
      description: "Help us develop mobile-first solutions for off-grid communities. Fresher-friendly.",
      type: "job",
      skills: ["React Native", "JavaScript", "Firebase"],
      tags: ["technology", "mobile"],
      location: "Remote",
      createdBy: ngo._id
    }
  ];

  await Opportunity.deleteMany({});
  await Opportunity.insertMany(opportunities);

  console.log("Successfully seeded NGO opportunities!");
  process.exit();
};

seed();
