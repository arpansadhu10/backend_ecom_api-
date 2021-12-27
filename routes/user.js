const express = require('express')
const router = express.Router();

const { signup, login, logout, forgotpassword, passwordReset, getLoggedInUserDetails, changePassword, updateUserDetails, admin_allUsers, manager_allUsers, admin_oneUser, admin_deleteOneUser } = require('../controllers/userController')
const { isLoggedIn, isAdmin, isManager } = require('../middlewares/user')

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/forgotpassword').post(forgotpassword)
router.route('/password/reset/:token').post(passwordReset)
router.route('/userdashboard').get(isLoggedIn, getLoggedInUserDetails)
router.route('/password/update').post(isLoggedIn, changePassword)
router.route('/userdashboard/update').post(isLoggedIn, updateUserDetails)
// router.route('admin/users').get(isLoggedIn, customRole("admin"), admin_allUsers)
router.route('/admin/users').get(isLoggedIn, isAdmin, admin_allUsers)
router.route('/manager/users').get(isLoggedIn, isManager, manager_allUsers)
router.route('/admin/user/:id').get(isLoggedIn, isAdmin, admin_oneUser)
    .delete(isLoggedIn, isAdmin, admin_deleteOneUser)

module.exports = router;