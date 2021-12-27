const bigPromise = require("../middlewares/bigPromise");
const order = require("../models/order");
const Order = require("../models/order");
const product = require("../models/product");
const Product = require("../models/product");
const CustomError = require("../utils/customError");


exports.createOrder = bigPromise(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    });

    res.status(200).json({
        success: true,
        order,
    })
})

exports.getOneOrder = bigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if (!order) {
        return next(new CustomError("Please check order id"), 401);
    }

    res.status(200).json({
        success: true,
        order,
    })
})

exports.getAllOrderOfLoginInUsers = bigPromise(async (req, res, next) => {
    const order = await Order.find({ user: req.user._id })
    // .populate('user', 'name email')

    if (!order) {
        return next(new CustomError("Please check order id"), 401);
    }

    res.status(200).json({
        success: true,
        order,
    })
})



exports.admin_getAllOrder = bigPromise(async (req, res, next) => {
    const orders = await Order.find({})
    // .populate('user', 'name email')


    res.status(200).json({
        success: true,
        orders,
    })
})
exports.admin_updateOrder = bigPromise(async (req, res, next) => {
    const orders = await Order.findById(req.params.id)
    // .populate('user', 'name email')

    if (req.body.orderStatus === "delivered") {
        return next(new CustomError("order is already marked as delivered"))
    }
    order.orderStatus = req.body.orderStatus;

    order.orderItems.forEach(async prod => {
        await updateProductStock(prod.product, prod.quantity)
    })

    //if order was delivered then stock --;
    await order.save();


    res.status(200).json({
        success: true,
        orders,
    })
})
async function updateProductStock(productId, quantity) {
    const product = await Product.findById(productId);

    product.stock = product.stock - quantity;

    product.save({ validateBeforeSave: false })
}


exports.admin_deleteOrder = bigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    // .populate('user', 'name email')

    order.remove();
    res.status(200).json({
        success: true,
    })
})




