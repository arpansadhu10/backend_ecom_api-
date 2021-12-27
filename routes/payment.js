const express = require("express");

const router = express.Router();
const { sendStripeKey, captureStripePayment, sendRazorpayKey, captureRazorpayPayment } = require('../controllers/paymentController')
const { isLoggedIn, isAdmin, isManager } = require('../middlewares/user')


router.route("/stripekey").get(isLoggedIn, sendStripeKey)
router.route("/razorpaykey").get(isLoggedIn, sendRazorpayKey)

router.route("/capturerazorpay").get(isLoggedIn, captureRazorpayPayment)
router.route("/capturestripe").get(isLoggedIn, captureStripePayment)


module.exports = router;