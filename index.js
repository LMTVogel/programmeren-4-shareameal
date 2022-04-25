const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const { get } = require("express/lib/response");
app.use(bodyParser.json());

let database = [];
let user_id = 0;

app.all("*", (req, res, next) => {
    const method = req.method;
    console.log(`Method ${method} is aangeroepen`);
    next();
});

app.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Hello World",
    });
});

app.route("/api/user")
    // Adds a new user in the database
    .post((req, res) => {
        let user = req.body;

        if (isEmailUnique(user.emailAddress)) {
            user_id++;
            user = {
                id: user_id,
                firstName: user.firstName,
                lastName: user.lastName,
                street: user.street,
                city: user.city,
                emailAddress: user.emailAddress,
                phoneNumber: user.phoneNumber,
                password: user.password,
                roles: user.roles,
            };
            database.push(user);
            res.status(201).json({
                status: 201,
                result: database,
            });
        } else {
            res.status(409).json({
                status: 409,
                result: "Email is already in use",
            });
        }
    })
    // Gets all users from database
    .get((req, res) => {
        res.status(200).json({
            status: 200,
            result: database,
        });
    });

// Gets the profile of the requested user
app.get("/api/user/profile", (req, res) => {
    res.status(501).json({
        status: 501,
        result: "The requested endpoint is not yet realized",
    });
});

// Gets the user by id
app.route("/api/user/:id")
    .get((req, res) => {
        const userId = req.params.id;
        let user = database.find((item) => item.id == userId);

        if (user) {
            res.status(200).json({
                status: 200,
                result: user,
            });
        } else {
            res.status(404).json({
                status: "User does not exist",
            });
        }
    })
    // Updates the user
    .put((req, res) => {
        let newUserInfo = req.body;
        const userId = req.params.id;
        let userIndex = database.findIndex((obj) => obj.id == userId);

        if (userIndex > -1) {
            if (Array.isArray(newUserInfo.roles)) {
                database[userIndex] = {
                    id: parseInt(userId),
                    firstName: newUserInfo.firstName,
                    lastName: newUserInfo.lastName,
                    street: newUserInfo.street,
                    city: newUserInfo.city,
                    phoneNumber: newUserInfo.phoneNumber,
                    password: newUserInfo.password,
                    emailAdress: newUserInfo.emailAdress,
                    roles: newUserInfo.roles,
                };

                res.status(200).json({
                    status: 200,
                    result: database[userIndex],
                });
            } else {
                res.status(400).json({
                    status: 400,
                    result: "Roles must be an array",
                });
            }
        } else {
            res.status(404).json({
                status: 404,
                result: "User not found",
            });
        }
    })
    // Deletes the user from the database
    .delete((req, res) => {
        const userId = req.params.id;
        let userIndex = database.findIndex((obj) => obj.id == userId);

        if (userIndex > -1) {
            database.splice(userIndex, 1);

            res.status(202).json({
                status: 202,
                result: "User is successfully deleted",
            });
        } else {
            res.status(404).json({
                status: 404,
                result: "User does not exist",
            });
        }
    });

app.all("*", (req, res) => {
    res.status(401).json({
        status: 401,
        result: "Endpoint not found",
    });
});

function isEmailUnique(emailAddress) {
    const emailArray = database.filter(
        (item) => item.emailAddress == emailAddress
    );

    if (emailArray.length > 0) {
        return false;
    }
    return true;
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
