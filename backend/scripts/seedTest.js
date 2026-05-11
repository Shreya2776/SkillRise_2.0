import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import Profile from "../src/models/Profile.js";

const INDIAN_STATES = [
  "Maharashtra", "Uttar Pradesh", "Karnataka", "Tamil Nadu", "Gujarat",
  "West Bengal", "Rajasthan", "Madhya Pradesh", "Bihar", "Andhra Pradesh",
  "Telangana", "Kerala", "Punjab", "Haryana", "Delhi"
];

const SKILLS = [
  "JavaScript", "Python", "React", "Node.js", "Java",
  "HTML", "CSS", "MongoDB", "SQL", "AWS",
  "Communication", "Leadership", "Problem Solving"
];

const seedTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    // Check if test users already exist
    const existingTestUsers = await User.countDocuments({ 
      email: { $regex: /^testuser/ } 
    });

    if (existingTestUsers > 0) {
      console.log(`${existingTestUsers} test users already exist. Skipping...`);
      mongoose.connection.close();
      return;
    }

    console.log("Creating 50 test users with profiles...");

    for (let i = 1; i <= 50; i++) {
      // Create user
      const user = await User.create({
        name: `Test User ${i}`,
        email: `testuser${i}@skillrise.com`,
        password: "password123",
        role: "user",
        isVerified: true
      });

      // Random state
      const state = INDIAN_STATES[Math.floor(Math.random() * INDIAN_STATES.length)];
      
      // Random skills (2-5 skills per user)
      const numSkills = Math.floor(Math.random() * 4) + 2;
      const userSkills = [];
      for (let j = 0; j < numSkills; j++) {
        const skill = SKILLS[Math.floor(Math.random() * SKILLS.length)];
        if (!userSkills.includes(skill)) {
          userSkills.push(skill);
        }
      }

      // Create profile
      await Profile.create({
        user: user._id,
        role: i % 3 === 0 ? "student" : i % 3 === 1 ? "professional" : "worker",
        data: {
          name: user.name,
          location: state,
          skills: userSkills.join(", "),
          phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          ...(i % 3 === 0 && {
            college: "Test College",
            degree: "B.Tech",
            year: "3rd"
          }),
          ...(i % 3 === 1 && {
            company: "Test Company",
            role: "Software Engineer",
            exp: `${Math.floor(Math.random() * 5) + 1} years`
          })
        }
      });

      if (i % 10 === 0) {
        console.log(`Created ${i} users...`);
      }
    }

    console.log("✅ Successfully created 50 test users with profiles!");
    console.log("📊 Data includes:");
    console.log(`   - Users across ${INDIAN_STATES.length} states`);
    console.log(`   - ${SKILLS.length} different skills`);
    console.log(`   - Mix of students, professionals, and workers`);

    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedTestData();
