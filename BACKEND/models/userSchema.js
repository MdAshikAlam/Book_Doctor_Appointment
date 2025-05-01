import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema=new mongoose.Schema({
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
    password:{
        type:String,
        minLength:[8,"Passwrod Must Contain At Least 8 Digits"],
        required:true,
        select:false
    },
    role:{
        type:String,
        required:true,
        enum:["Admin", "Patient", "Doctor"],
    },
    doctorDepartment:{
        type:String,
    },
    docPicture:{
        public_id:String,
        url:String,
    },
});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password= await bcrypt.hash(this.password,10); // ye password ko hash hokar kuch alag value me save me hoga
});

userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

userSchema.methods.generateJsonWebToken=function(){
return jwt.sign({id:this._id},process.env.JWT_SECRET_KEY,{
    expiresIn: process.env.JWT_EXPIRES,
});
}
export const User=mongoose.model("user",userSchema);
