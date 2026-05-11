import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    const adminEmail = "admin@skillrise.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exists!");
    } else {
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: "adminpassword123",
        role: "admin",
        isVerified: true
      });
      console.log("Admin account created successfully!");
      console.log("Email: admin@skillrise.com");
      console.log("Password: adminpassword123");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedAdmin();
