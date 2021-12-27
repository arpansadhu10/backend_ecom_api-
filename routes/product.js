const express = require('express')
const router = express.Router();

const { test, addProduct, getAllProducts, admin_getAllProducts, getOneProduct, admin_updateOneProduct, admin_deleteOneProduct, addReview, deleteReview, getOnlyReviewsForOneProduct } = require('../controllers/productController')
const { isLoggedIn, isAdmin, isManager } = require('../middlewares/user')


router.route("/test").get(test)

router.route("/products").get(isLoggedIn, getAllProducts)
router.route("/product/:id").get(getOneProduct)
router.route("/review").put(isLoggedIn, addReview)
router.route("/review").delete(isLoggedIn, deleteReview)
router.route("/reviews").get(getOnlyReviewsForOneProduct)


//admin routes
router.route("/admin/product/add").post(isLoggedIn, isAdmin, addProduct)
router.route("/admin/products").get(isLoggedIn, isAdmin, admin_getAllProducts)
router.route("/admin/product/:id").put(isLoggedIn, isAdmin, admin_updateOneProduct)
    .delete(isLoggedIn, isAdmin, admin_deleteOneProduct)

module.exports = router;