const assert = require("assert");
let database = [];
let user_id = 0;

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let object = {
            name: "davide",
            year: 2020,
        };
        let {
            firstName,
            lastName,
            street,
            city,
            emailAddress,
            phoneNumber,
            password,
        } = user;
        // TODO: create more asserts to check types
        try {
            assert(
                typeof firstName === "string",
                "First name must be a string"
            );
            assert(typeof lastName === "string", "Last name must be a string");
            assert(typeof street === "string", "Street must be a string");
        } catch (err) {
            const error = {
                status: 400,
                result: err.message,
            };

            next(error);
        }
    },
    addUser: (req, res) => {
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
    },
    getAllUsers: (req, res) => {
        res.status(200).json({
            status: 200,
            result: database,
        });
    },
    getUserById: (req, res, next) => {
        const userId = req.params.id;
        let user = database.find((item) => item.id == userId);

        if (user) {
            res.status(200).json({
                status: 200,
                result: user,
            });
        } else {
            const error = {
                status: 404,
                result: "User does not exist",
            };

            next(error);
        }
    },
    updateUser: (req, res) => {
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
    },
    deleteUser: (req, res) => {
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
    },
};

function isEmailUnique(emailAddress) {
    const emailArray = database.filter(
        (item) => item.emailAddress == emailAddress
    );

    if (emailArray.length > 0) {
        return false;
    }
    return true;
}

module.exports = controller;
