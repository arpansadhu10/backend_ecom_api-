const express = require("express");
const app = require("../app");
const router = express.Router();



const { home } = require('../controllers/homeController')


//importing all routes
router.route("/").get(home);





module.exports = router;