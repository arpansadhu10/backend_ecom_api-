const mongoose = require('mongoose')
const User = require('./user')


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please provide product name"],
        trim: true,
        maxlength: [120, "name should be more than 120 characters"],
    },
    price: {
        type: Number,
        required: [true, "please provide product price"],
        // maxlength:[120,"name should be more than 120 characters"],
    },
    description: {
        type: String,
        required: [true, "please provide product description"],
        // maxlength:[120,"name should be more than 120 characters"],
    },
    photos: [
        {
            id: { type: String, required: true },
            secure_url: { type: String, required: true },
        }
    ],
    category: {
        type: String,
        required: [true, 'please select catagory from- short-sleeves,long-sleeves,sweat-shirts,hoodies'],
        enum: {
            values: ["shortSleeves", "longSleeves", "sweatShirts", "hoodies"],
            message: "please select catagory from from- short-sleeves,long-sleeves,sweat-shirts,hoodies"
        },

    },
    stock: {
        type: Number,
        required: [true, "please add stock"]
    },
    brand: {
        type: String,
        required: [true, "please add a brand for clothing"],
    },
    rating: {
        type: Number,
        default: 0,
    },
    numberOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

})

module.exports = mongoose.model("Product", productSchema)