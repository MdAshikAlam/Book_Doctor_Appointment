import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler, { errorMiddleware } from "../middlewares/errorMiddleware.js";
import {User} from "../models/userSchema.js";
import {generateToken} from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
// patient register
export const patientRegister=catchAsyncErrors(async(req,res,next)=>{
    const {
        firstName,
        lastName,
        email,
        phone,
        adhar,
        dob,
        gender,
        password,
        role,
    }=req.body;
    if(
        !firstName||
        !lastName||
        !email||
        !phone||
        !password||
        !gender ||
        !dob ||
        !adhar ||
        !role
    ) {
        return next(new ErrorHandler("Please Fill Full Form!",400));
    }
    let user =await User.findOne({ email });
    if(user){
        return next(new ErrorHandler("User Already Registerd!",400));
    }

    user=await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        adhar,
        role,
    });
    generateToken(user,"User Registered!", 200,res);
});
// login
export const login=catchAsyncErrors(async(req,res,next)=>{
const{ email,password,confirmPassword,role}=req.body;
if(!email ||!password || !confirmPassword || !role){
    return next(new ErrorHandler("Please Provide All Details",400));
}
if(password!==confirmPassword){
    return next(
        new ErrorHandler("Password And Confirm Password Do Not Match!",400)
    );
}
const user=await User.findOne({email}).select("+password");
if(!user) {
        return next(new ErrorHandler("Invalid Email of Password",400));
    }
const isPasswordMatched=await user.comparePassword(password);
if(!isPasswordMatched){
    return next(new ErrorHandler("Invalid Password or Email",400));
}
if(role!==user.role){
    return next(new ErrorHandler("User With This role Not Found!",400));
}
generateToken(user,"User Login Successfully!", 200,res);
});
 //Add new admin
export const addNewAdmin=catchAsyncErrors(async(req,res,next)=>{
    const {firstName,lastName,email,phone,password,gender,dob,adhar,
    }=req.body;
    if(
        !firstName||
        !lastName||
        !email||
        !phone||
        !password||
        !gender ||
        !dob ||
        !adhar
       ) {
        return next(new ErrorHandler("Please Fill Full Form!",400));
         }
         const isRegistered = await User.findOne({ email });
         if(isRegistered){
            return next(new ErrorHandler(`${isRegistered.role} with This Email Already Exists!`));
         }
         const admin = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password,
            gender,
            dob,
            adhar,
            role:"Admin",
         });
         res.status(200).json({
            success:true,
            message:" New Admin Registered",
         });
});

export const getAllDoctors=catchAsyncErrors(async(req,res,next)=>{
    const doctors=await User.find({role:"Doctor"});
    res.status(200).json({
        success:true,
        doctors,
    });
});



export const getUserDetails =catchAsyncErrors(async(req,res,next)=>{
    const user=req.user;
    res.status(200).json({
        success:true,
        user,
    });
});

export const logoutAdmin=catchAsyncErrors(async(req,res,next)=>{
    res
    .status(200)
    .cookie("adminToken","", {
        httpOnly:true,
        expires:new Date(Date.now()),
    })
    .json({
        success:true,
        message:"Admin Log Out Successfully"
    });
});

export const logoutPatient=catchAsyncErrors(async(req,res,next)=>{
    res
    .status(200)
    .cookie("patientToken","", {
        httpOnly:true,
        expires:new Date(Date.now()),
    })
    .json({
        success:true,
        message:"Patient Log Out Successfully"
    });
});

export const addNewDoctor=catchAsyncErrors(async(req,res,next)=>{
    if(!req.files || Object.keys(req.files).length===0){
        return next(new ErrorHandler("Doctor Picture Required!",400));
    }
    const {docPicture}=req.files;
    const allowedFormats=["image/png","image/jpeg","image/jpg","image/webp"];
    if(!allowedFormats.includes(docPicture.mimetype)){
        return next(new ErrorHandler("File Format Not Supported!",400));
    }
    const { 
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        adhar,
        doctorDepartment
        }=req.body;
        if(
          ( !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password ||
            !gender ||
            !dob ||
            !adhar ||
            !doctorDepartment)
        ){
            return next(new ErrorHandler("Please Provide Full Details",400));
        }
       const isRegistered=await User.findOne({email});
       if(isRegistered){
        return next (
            new ErrorHandler(
                `${isRegistered.role} already registered with this email`,
                400
            )
        );
       }
       const cloudinaryResponse=await cloudinary.uploader.upload(
        docPicture.tempFilePath
       );
       if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error(
            "Cloudinary Error",
            cloudinaryResponse.error || "Unknown Cloudinary Error"
        );
       }
       const doctor= await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        adhar,
        doctorDepartment,
        role:"Doctor",
        docPicture: {
            public_id:cloudinaryResponse.public_id,
            url:cloudinaryResponse.secure_url,
        },
       });
       res.status(200).json({
        success:true,
        message:"New Doctor Registered!",
        doctor
       });
});