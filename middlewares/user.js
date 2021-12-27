const jwt = require("jsonwebtoken");
const User = require("../models/user");
const CustomError = require("../utils/customError");
const bigPromise = require("./bigPromise");


exports.isLoggedIn = bigPromise(async (req, res, next) => {

    const authorizationBearer = req.header("Authorization") ? req.header("Authorization").replace("Bearer ", "") : null;

    const token = req.cookies.token || authorizationBearer;

    if (!token) {
        return next(new CustomError("Login first to continue...", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
})

// exports.customRole = (roles) => {
//     console.log(roles);

// }

exports.isAdmin = (req, res, next) => {
    const userRole = req.user.role;
    if (userRole == "admin") {
        next();
    }
    else {
        res.status(402).json({ error: "USER is not admin" })
    }
}
exports.isManager = (req, res, next) => {
    const userRole = req.user.role;
    if (userRole == "manager") {
        next();
    }
    else {
        res.status(402).json({ error: "USER is not manager" })
    }
}

