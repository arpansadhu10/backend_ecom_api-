const nodemailer = require("nodemailer");

exports.mailHelper = async (option) => {

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        // secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // generated ethereal user
            pass: process.env.SMTP_PASS, // generated ethereal password
        },
        // tls: {
        //     rejectUnauthorized: false
        // },
        // connectionTimeout: 5 * 60 * 1000,
    });

    const message = {
        from: 'arpansadhu04@gmail.com', // sender address
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        text: option.message, // plain text body
        // html: "<b>Hello world?</b>", // html body
    }
    console.log(message);

    // send mail with defined transport object
    let info = await transporter.sendMail(message);
}

// module.exports = mailHelper;