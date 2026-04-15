import mongoose, { Schema } from "mongoose";
import validator from "validator";

const appointmentSchema=new mongoose.Schema({
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
    adhar:{
        type:String,
        required:true,
        minLength: [12,"Adhar Must Contain Exact 12 Digits!"],
        maxLength: [12,"Adhar Must Contain Exact 12 Digits!"],
    },
    dob:{
        type:Date,
        required:[true,"DOB is requird"],
    },
    gender:{
        type:String,
        required:true,
        enum: ["Male","Female"],
    },
    appointment_date:{
        type:String,
        required:true,
    },
    timing:{
        type:String,
        required:true,
    },
    department:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
    doctor:{
        firstName:{
            type:String,
            required:true,
        },
        lastName:{
            type:String,
            required:true,
        }
    },
        hasVisited:{
            type:Boolean,
            default:false,
        },
        doctorId:{
            type:mongoose.Schema.ObjectId,
            required:true,
        },
        patientId:{
            type:mongoose.Schema.ObjectId,
            required:true,
        },
        address:{
            type:String,
            required:true,
        },
        status:{
            type:String,
            enum:["Pending","Accepted","Rejected"],
            default:"Pending",
        },
});

export const Appointment =mongoose.model("Appointment",appointmentSchema);