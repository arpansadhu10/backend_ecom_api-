const mongoose = require('mongoose')

const database_url = process.env.DB_URL;

exports.connect = () => {
    mongoose.connect(database_url, {
        useNewUrlPArser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("DB CONNECTED successfully");
    })
        .catch((error) => {

            console.log("DB connection failure");
            console.log(error);
            process.exit(1);
        })
} 