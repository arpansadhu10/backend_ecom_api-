const User = require('../models/user');
const bigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const cloudinary = require('cloudinary');
const crypto = require('crypto');

// images
const fileupload = require('express-fileupload');
const { mailHelper } = require('../utils/emailHelper');
let result;
exports.signup = bigPromise(async (req, res, next) => {
    //image
    const { name, email, password } = req.body;
    if (!email || !name || !password) {
        return next(new CustomError("name email and password are required", 400))

    }

    if (req.files) {
        let file = req.files.photo  //frontend
        result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "tshirtBackend",
            width: 150,
            crop: "scale"
        })


    }




    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    });
    //made a utility to set cookie using user and res
    cookieToken(user, res);


})

exports.login = bigPromise(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
        console.log("enter password and email...");
        return res.status(400).send("enter email and passsword")
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return res.status(400).send("user not found in db");
    }

    const isPasswordValid = await user.isValidatedPassword(password);
    if (!isPasswordValid) {
        return res.status(400).send("password wrong")
    }

    cookieToken(user, res);


})

exports.logout = bigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "logged out seccessfully"
    })
})

exports.forgotpassword = bigPromise(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).send("user not resistere in db")
    }

    const forgotToken = user.getForgotPasswordToken()
    user.forgotPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000);
    await user.save({ validateBeforeSave: false })

    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`
    console.log(myUrl);
    const message = `Copy paste this link in your browser and hot enter \n\n\n ${myUrl}`
    console.log(email, message);
    try {
        const option = {
            email: email,
            subject: "password reset email ||arpanStore",
            message
        }
        // console.log(option);
        await mailHelper(option)

        res.status(200).json({
            success: true,
            message: "email send successfully"
        })
    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        console.log("email sending error");
        // console.log(error);
        return next(new CustomError(error, 500))

    }
})

exports.passwordReset = bigPromise(async (req, res, next) => {
    const token = req.params.token;
    //in database hashed token is stored....so user entered token is to be hashed
    const encryToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    console.log(encryToken);
    const user = await User.findOne({
        encryToken,
        forgotPasswordExpiry: { $gt: Date.now() }, //$gt greater than 
    });
    console.log(user);
    if (user.forgotPasswordExpiry > Date.now()) {
        console.log("not yet expired");
    }

    if (!user) {
        return next(new CustomError('Token is invalid or expired or user not found'), 500)
    }

    if (req.body.password != req.body.confirmPassword) {
        return next(new CustomError("password and confirm password not same."))
    }
    user.password = req.body.password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save({ validateBeforeSave: false })


    cookieToken(user, res);
})


exports.getLoggedInUserDetails = bigPromise(async (req, res, next) => {

    const user = await User.findById(req.user.id) //we have created req,user in user.js middleware
    console.log(user);
    res.status(200).json({
        success: true,
        user
    })
})

exports.changePassword = bigPromise(async (req, res, next) => {
    const userId = req.user.id;

    const user = await User.findById(userId).select("+password")

    const IspasswordCorrect = await user.isValidatedPassword(req.body.oldPassword)
    if (!IspasswordCorrect) {
        return res.status(401).json({ error: "password wrong" })
    }
    else {
        const newPassword = req.body.newPassword;

        user.password = newPassword;
        await user.save();
        return res.status(200).json({ message: "password changed successfully" });
    }
})

exports.updateUserDetails = bigPromise(async (req, res, next) => {

    // const newData = {}
    //email and name compulsary
    const userDetails = await User.findById(req.user.id);

    //if user doesnt provide it then by defalut it would take previous values
    if (!req.body.name) {
        req.body.name = userDetails.name;
    }
    if (!req.body.email) {
        req.body.email = userDetails.email;
    }

    const newData = {
        name: req.body.name,
        email: req.body.email,
    }


    //photo replacing
    if (req.files) {
        const user = await User.findById(req.user.id);
        const imageId = user.photo.id

        const response = await cloudinary.v2.uploader.destroy(imageId);

        let file = req.files.photo  //frontend
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "tshirtBackend",
            width: 150,
            crop: "scale"
        })
        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        user
    })
})

exports.admin_allUsers = bigPromise(async (req, res, next) => {
    const users = await User.find({})
    console.log(users);
    res.status(200).json({
        success: true,
        users
    })
})

exports.manager_allUsers = bigPromise(async (req, res, next) => {
    const users = await User.find({ role: 'user' })//this will not give data of other admins
    console.log(users);
    res.status(200).json({
        success: true,
        users
    })
})

exports.admin_oneUser = bigPromise(async (req, res, next) => {
    const UserId = req.params.id;
    const user = await User.findOne({ UserId })
    if (!user) {
        return res.status(400).json({ error: "user not found in db" })
    }
    // console.log(user);
    res.status(200).json({
        success: true,
        user
    })
})

exports.admin_deleteOneUser = bigPromise(async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(400).send("User not found...")
    }

    //delete the photo from cloudinary
    const imageId = user.photo.id
    const response = await cloudinary.v2.uploader.destroy(imageId);


    await user.remove();

    res.status(200).json({
        success: true
    })
})