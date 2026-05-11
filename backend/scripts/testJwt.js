import "dotenv/config";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const testAuth = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ role: "ngo" });
        if (!user) {
            console.log("No NGO user found");
            process.exit(0);
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        console.log("Token:", token);
        console.log("JWT_SECRET used:", process.env.JWT_SECRET);
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Self verification SUCCESS:", decoded.id);
        } catch (err) {
            console.log("Self verification FAILED:", err.message);
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

testAuth();
