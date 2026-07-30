const mongoose=require("mongoose");

const UserSchema=new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,

    },
    password:{
        type:String,
        required:true
    },
    number:{

        type:String,
        required:true

    },
    role:{
        type:String,
        default:"user",
    },

    // Used for admin activity reporting. This is an activity timestamp, not a
    // claim that the user has a currently open browser session.
    lastLoginAt: {
        type: Date,
        default: null,
    }

}, { timestamps: true })

module.exports=mongoose.model("User",UserSchema)
