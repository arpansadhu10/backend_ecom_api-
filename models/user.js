const mongoose = require('mongoose')
const validator = require('validator')

//to encrypt password
const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

//to gegnerate random string for forgot password
const crypto = require("crypto");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        requires: [true, 'Please provide a name'],
        maxlength: [40, 'name should be only 40 characters long']
    },
    email: {
        type: String,
        requires: [true, 'Please provide a name'],
        validate: [validator.isEmail, 'enter proper email format'],
        unique: true
    },
    password: {
        type: String,
        requires: [true, 'Please provide a password'],
        minlength: [6, 'password should be atleast 6 chars'],
        select: false //the password fiels will not come while returnng object
    },
    role: {
        type: String,
        default: 'user',
    },
    photo: {
        id: {
            type: String,
            require: true,
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }


})


//ecnrypt password before save
//pre and post are lifecycle hooks
//^ in pre it is the momment just before saving to the database
userSchema.pre('save', async function (next) {
    //the method will only triggre if there is any passeord
    //creation or change request
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
});


//validate the password with passes on user password
userSchema.methods.isValidatedPassword = async function (usersendPassword) {
    return await bcrypt.compare(usersendPassword, this.password)
}

//
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY })
}

//generate forgot password token(string)
userSchema.methods.getForgotPasswordToken = function () {
    //generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString("hex");

    //! storing hashed string on the database,,,
    //! when the user sends back the token run the exact same hash function
    //! and then compare with the database
    this.forgotPasswordToken =
        crypto
            .createHash('sha256')
            .update(forgotToken)
            .digest("hex");

    //time
    this.forgotPasswordExpiry = Date.now() + process.env.FORGOT_PASSWORD_EXPIRY


    return forgotToken
}


module.exports = mongoose.model("User", userSchema)

