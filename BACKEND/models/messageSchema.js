import mongoose from "mongoose";
import validator from "validator";

const messageSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength: [3,"First Name Must Contain At Least 3 Characters!"]
    },
    lastName:{
        type:String,
        required:true,
        minLength: [3,"Last Name Must Contain At Least 3 Characters!"]
    },
    email:{
        type:String,
        required:true,
        validate: [validator.isEmail, "Please provide valid Email"]
    },
    phone:{
        type:String,
        required:true,
        minLength: [11,"Phone Number Must Contain 11 Digits!"],
        maxLength: [11,"Phone Number Must Contain 11 Digits!"],
    },
    message:{
        type:String,
        required:true,
        minLength: [10,"Message Must Contain At Least 10 character"],
    }, 
});

export const Message=mongoose.model("Message",messageSchema);