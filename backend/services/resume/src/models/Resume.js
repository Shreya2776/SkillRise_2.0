import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({

    resumeText:{
        type:String
    },

    skills:[
        {
            type:String
        }
    ],

    atsScore:{
        type:Number
    },

    suggestions:{
        type:String
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

});

export default mongoose.model("Resume",resumeSchema);