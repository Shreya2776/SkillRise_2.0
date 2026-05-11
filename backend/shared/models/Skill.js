const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  description: { type: String },
  demandLevel: { type: String, enum: ['low', 'medium', 'high'] },
  relatedCourses: [{ type: String }],
});

module.exports = mongoose.model('Skill', skillSchema);
