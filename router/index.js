const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/index');
const verifyToken = require('../middleware');

const router = express.Router();

router.get('/test',(req,res)=>{
    res.json({message:"api testing"})
});



router.post('/user',async(req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email});

    if(!user){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword =  await bcrypt.hash(password,salt);

        const newUser = new User({email,password:hashedPassword});
        await newUser.save();
        return res.status(201).json({message:"user Created"})
    };
    res.status(404).send("user already existed")

})


router.post('/auth',async(req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email});

    if(!user){
        return res.status(404).send({message:"user not found"});
    }
    
    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.status(404).send({message:"invalid password"})
    }
const generateToken =  require('../utils/index');
    const token = generateToken(user);
    res.json({token})
})


router.get('/data',verifyToken,(req,res)=>{
    res.send({message:`welcome,${req.user.email}!! this is protected data`})
})


router.post('/reset-pass',async(req,res)=>{
    const {email} =req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.status(404).send({message:"user not found"});
    }

    const token = Math.random().toString(36).slice(-8);
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 3600000 // 1hr

    await user.save();
const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"yokeshsre@gmail.com",
            pass:"pfewvpvqplvrdhyp"
        },
    })
    const message = {
        from:"yokeshsre@gmail.com",
        to:  user.email,
        subject:"password reset request",
        text:`you are receiving this email because requested a password reset for your account. \n\n please use the following token to reset your password :  ${token}\n\n if you did not request a password reset, please ignore this email.`
    }
    transporter.sendMail(message,(error,info)=>{
        if(error){
            res.status(404).send({message:"something went wrong try again!!!!"})
        }
        res.status(200).send({messge:"reset password to email sent successfully " + info.response})
    })
})


router.post('/reset-pass/:token',async(req,res)=>{
    const {token} =  req.params;
    const {password} = req.body;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire:{$gt:Date.now()}
    })

    if(!user){
        return res.status(404).send({message:"Invalid token"});
    }

    const hashedPassword =  await bcrypt.hash(password,10);
    user.password=hashedPassword;
    user.resetPasswordToken=null;
    user.resetPasswordExpire=null;

    await user.save();

    res.send({message:"password reset successfully"});
})

module.exports = router;
