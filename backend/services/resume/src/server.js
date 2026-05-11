import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import analyzerRoutes from "./routes/analyzerRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analyzer", analyzerRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDB connected");
})
.catch(err=>console.log(err));

const PORT = process.env.PORT || 5001;

app.listen(PORT,()=>{
    console.log(`AI Resume Analyzer running on ${PORT}`);
});

app.get("/", (req,res)=>{
 res.send("Backend running");
});

console.log("GEMINI KEY:", process.env.GEMINI_API_KEY?.slice(0,10));