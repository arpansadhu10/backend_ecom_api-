const app = require("./app");
const { connect } = require("./config/db");
require('dotenv').config();

//connect with database
connect()

//cloudinary
const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`);
})