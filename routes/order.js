const express = require('express');
const router = express.Router();

const { createOrder, getOneOrder, getAllOrderOfLoginInUsers, admin_getAllOrder, admin_updateOrder, admin_deleteOrder } = require('../controllers/orderController')
const { isLoggedIn, isAdmin, isManager } = require('../middlewares/user')

router.route("/order/create").post(isLoggedIn, createOrder)
router.route("/myorder").get(isLoggedIn, getAllOrderOfLoginInUsers)
router.route("/order/:id").get(isLoggedIn, getOneOrder)


router.route("admin/orders").get(isLoggedIn, isAdmin, admin_getAllOrder)
router.route("admin/order/:id").put(isLoggedIn, isAdmin, admin_updateOrder)
    .delete(isLoggedIn, isAdmin, admin_deleteOrder)

module.exports = router;
