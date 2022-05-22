const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");

router.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Hello World",
    });
});

router
    .route("/user")
    // Adds a new user in the database
    .post(userController.validateUser, userController.addUser)
    // Gets all users from database
    .get(userController.getAllUsers);

// Gets the profile of the requested user
router.get("/user/profile", authController.validateToken, userController.getUserProfile)

// Gets the user by id
router
    .route("/user/:id")
    .get(userController.getUserById)
    // Updates the user
    .put(userController.updateUser)
    // Deletes the user from the database
    .delete(userController.deleteUser);

module.exports = router;
