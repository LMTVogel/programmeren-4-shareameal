const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Hello World",
    });
});

router
    .route("/api/user")
    // Adds a new user in the database
    .post(userController.addUser)
    // Gets all users from database
    .get(userController.getAllUsers);

// Gets the profile of the requested user
router.get("/api/user/profile", (req, res) => {
    res.status(501).json({
        status: 501,
        result: "The requested endpoint is not yet realized",
    });
});

// Gets the user by id
router
    .route("/api/user/:id")
    .get(userController.getUserById)
    // Updates the user
    .put(userController.updateUser)
    // Deletes the user from the database
    .delete(userController.deleteUser);

module.exports = router;
