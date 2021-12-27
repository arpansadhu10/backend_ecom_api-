const Product = require("../models/product")
const bigPromise = require("../middlewares/bigPromise")
const CustomError = require('../utils/customError');
const cloudinary = require('cloudinary');
const WhereClause = require("../utils/whereClause");


exports.test = (req, res) => {
    res.status(200).json({ message: "hello from product route" })
}

exports.addProduct = bigPromise(async (req, res, next) => {
    //images
    let imageArray = []

    if (!req.files) {
        return next(new CustomError("images are required", 401));
    }

    if (req.files) {
        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: "products"
            })
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            });

        }
    }

    req.body.photos = imageArray;
    req.body.user = req.user.id

    const product = await Product.create(req.body)

    res.status(200).json({ success: true, product })




})

exports.getAllProducts = bigPromise(async (req, res, next) => {

    const resultPerPage = 6;
    const totalcountProduct = await Product.countDocuments()

    const productsObj = new WhereClause(Product.find(), req.query).search().filter();

    let products = await productsObj.base;
    const filteredProductNumber = products.length

    productsObj.pager(resultPerPage)

    products = await productsObj.base.clone()

    res.status(200).json({
        success: true,
        products,
        filteredProductNumber,
        totalcountProduct
    })
})


exports.getOneProduct = bigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new CustomError("no product found with thi id", 401))
    }
    res.status(200).json({
        success: true,
        product
    })
})

exports.addReview = bigPromise(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment: comment,
    }

    const product = await Product.findById(productId)

    //whether this user is alredy ,ade any review or not

    const alreadyReviewed = product.reviews.find(
        (review) => review.user.toString() === req.user._id.toString()
    )

    if (alreadyReviewed) {
        product.reviews.forEach((review) => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment
                review.rating = rating
            }
        })
    } else {
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length;
    }

    //adjus ratings
    product.ratings = product.reviews.reduce((acc, item) =>
        item.rating + acc, 0) / product.reviews.length

    // save

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true
    })

})
exports.deleteReview = bigPromise(async (req, res, next) => {
    const { productId } = req.query
    const product = await Product.findById(productId);

    const reviews = product.reviews.filter(
        (review) => review.user.toString() === req.user._id.toString()
    )
    const numberOfReviews = reviews.length

    product.ratings = product.reviews.reduce((acc, item) =>
        item.rating + acc, 0) / product.reviews.length

    //update the product
    await Product.findByIdAndUpdate(productId, {
        reviews,
        ratings,
        numberOfReviews
    }, {
        new: true,
        runValidators: true,
    })
    res.status(200).json({
        success: true
    })

})

exports.getOnlyReviewsForOneProduct = bigPromise(async (req, res, next) => {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(400).json({ message: "no products found" });
    }
    res.status(200).json({
        success: "true",
        reviews: product.reviews
    })
});


exports.admin_getAllProducts = bigPromise(async (req, res, next) => {

    const products = await Product.find({});

    if (!products) {
        return res.json({ error: "no products found" })
    }
    res.status(200).json({
        success: true,
        products
    })
})

exports.admin_updateOneProduct = bigPromise(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return res.json({ error: "no products found" })
    }
    let imagesArray = [];

    if (req.files) {
        //destroy the previous photos
        for (let index = 0; index < product.photos.length; index++) {

            const result = await cloudinary.v2.uploader.destroy(product.photos[index].id);

        }

        //add new photos
        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: "products"
            })
            imagesArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            });

        }
        req.body.photos = imagesArray;
    }



    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        product
    })



})


exports.admin_deleteOneProduct = bigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(400).json({ message: "Product not found" })
    }

    for (let index = 0; index < product.photos.length; index++) {

        const result = await cloudinary.v2.uploader.destroy(product.photos[index].id);
    }

    await product.remove();

    res.status(200).json({
        success: true,
        "message": "product was deleted"
    })



})