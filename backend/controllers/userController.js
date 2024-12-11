const ErrorHandler=require("../utils/errorhandler");
const User=require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const catchAsyncError = require("../middleware/catchAsyncError");
const  crypto= require("crypto");
exports.registerUser = catchAsyncError(async(req,res,next)=>{
    const {name,email,password}=req.body;

    const user= await User.create({
        name,email,password,
        avatar:{
            public_id:"this is a sample id",
            url:"profileUrl"
        }
    });
    // const token=user.getJWTToken();
    // res.status(201).json({
    //     success:true,
    //     user,
    //     token,
    // })
    //or 
    sendToken(user,201,res);
});

exports.loginUser = catchAsyncError(async(req,res,next)=>{
    const {email,password}=req.body;

    //check if user has given password and email both

    if(!email || !password)return next(new ErrorHandler("Please Enter Email and Password",401));

    const user=await User.findOne({email}).select("+password");//as we do password false so to fetch password details

    if(!user){
        return next(new ErrorHandler("Invalid email or password",401));
    }
    const isPasswordMatched=user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401));
    }
    sendToken(user,200,res);
});

exports.logout=catchAsyncError(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({
        success:true,
        message: "Logged Out",
    });
});

exports.forgotPassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("User not found",404));

    }

    //Get ResetPassword Token from userSchema
    const resetToken=user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});
    // req.protocal is http or https
    //req.get("host") is local host
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/${resetToken}`

    const message= `Your password reset token is:- \n\n${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it`;

    try{
        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message,
        });
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`,
        })
    }catch(err){
        this.resetPasswordToken=undefined;
        this.resetPasswordExpire=undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(err.message,500));
    }
});



exports.resetPassword = catchAsyncError(async(req,res,next)=>{
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex"); 

    // crypto value jo generate kri thi usse check kr rhe hai kya kisi user ne generate kia usse abhi

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire :{ $gt:Date.now()},
    });

    if(!user){
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired",400));
    }
    if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",400));
    }

    user.password= req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();

    sendToken(user,200,res);
});

exports.getUserDetails = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user,
    })
});

//change user password
exports.updatePassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched=user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect",401));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",401));
    }

    user.password=req.body.newPassword;
    await user.save();
    sendToken(user,200,res);
});

// update profile
exports.updateProfile = catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
    }

    //for avatar to be continued 

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success:true,
    })

});


//Get all users(admin)
exports.getAllUser = catchAsyncError(async(req,res,next)=>{
    const users = await User.find();

    res.status(200).json({
        success:true,
        users,
    }); 
});

// get single user (admin)
exports.getSingleUser = catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`));
    }
    res.status(200).json({
        success:true,
        user,
    }); 
});

// update profile role  -- Admin
exports.updateUserRole = catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success:true,
        user
    });
});

exports.deleteProfile = catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.params.id);

    //we will remove cloudnary

    if(!user){
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`));
    }
    await user.remove()
    res.status(200).json({
        success:true,
    })

});