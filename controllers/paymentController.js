const req = require("express/lib/request");
const bigPromise = require("../middlewares/bigPromise")
const stripe = require('stripe')(process.env.STRIPE_SECRET);



exports.sendStripeKey = bigPromise(async (req, res, next) => {
    res.status(200).json({
        success: true,
        public_key: process.env.STRIPE_API_KEY
    })
})

exports.captureStripePayment = bigPromise(async (req, res, next) => {

    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body,
        currency: 'inr',
        // automatic_payment_methods: { enabled: true },

        //optional
        metadata: { integration_check: 'accepy_a_payment' }
    });

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret,
        amount: req.body.amount,

    })
})

exports.sendRazorpayKey = bigPromise(async (req, res, next) => {
    res.status(200).json({
        success: true,
        public_key: process.env.RAZORPAY_KEY
    })
})
exports.captureRazorpayPayment = bigPromise(async (req, res, next) => {
    var instance = new Razorpay({
        key_id:
            process.env.RAZORPAY_KEY, key_secret: process.env.RAZORPAY_SECRET
    })

    var options = {
        amount: req.body.amount * 100,
        currency: "INR",
    }

    const myOrder = await instance.orders.create(options)

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        order: myOrder
    })

})

