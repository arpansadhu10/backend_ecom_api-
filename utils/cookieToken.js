const cookieToken = (user, res) => {
    const token = user.getJwtToken();
    console.log(token);
    console.log("");

    //msking the cookie
    const option = {
        expires: new Date(Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000),
        httpOnly: true,      //cookie is only accessabel in backend

    }
    return res.status(200).cookie('token', token, option).json({
        success: true,
        token,
        user
    })

}


module.exports = cookieToken