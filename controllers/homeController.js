const bigPromise = require('../middlewares/bigPromise')


exports.home = bigPromise((req, res) => {  //or use async await
    res.status(200).json({
        success: true,
        greeting: "Hello from Api"
    });
});

