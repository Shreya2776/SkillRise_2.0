// controllers/profileController.js

import Student from "../models/Student.js";
import Professional from "../models/Professional.js";
import Worker from "../models/Worker.js";
import mongoose from "mongoose";
import Profile from "../models/Profile.js";
export const saveProfile = async (req, res) => {
  try {
    const { role, data } = req.body;

    let profile = await Profile.findOne({ user: req.user });

    if (profile) {
      // 🔥 UPDATE
      profile.role = role;
      profile.data = data;
      await profile.save();
    } else {
      // 🔥 CREATE
      profile = new Profile({
        user: req.user,
        role,
        data,
      });
      await profile.save();
    }

    res.json({ profile });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user });
    console.log("USER ID:", req.user);
    console.log("PROFILE:", profile);
    if (!profile) {
      const newProfile = new Profile({
        user: req.user,
        data: {},
  });

  await newProfile.save();

  return res.json({ profile: newProfile });
    }

    res.json({ profile });

  } catch (err) {
    console.error("ERROR:", err); 
    res.status(500).json({ msg: "Server error" });
  }
};

mongoose.connection.on("connected", () => {
  console.log("MongoDB Connected:", mongoose.connection.name);
});