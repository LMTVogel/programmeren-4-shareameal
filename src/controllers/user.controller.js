const assert = require("assert");
const dbconnection = require("../../database/dbconnection");
let database = [];
let user_id = 0;

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let {
            firstName,
            lastName,
            street,
            city,
            isActive,
            emailAddress,
            phoneNumber,
            password,
        } = user;

        try {
            assert(typeof firstName === 'string', 'First name must be a string');
            assert(typeof lastName === 'string', 'Last name must be a string');
            assert(typeof street === 'string', 'Street must be a string');
            assert(typeof city === 'string', 'City must be a string');
            assert(typeof isActive === 'boolean', 'IsActive must be a boolean');
            assert(typeof emailAddress === 'string', 'Email address must be a string');
            assert(typeof phoneNumber === 'string', 'Phone number must be a string');
            assert(typeof password === 'string', 'Password must a string');

            next();
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
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
          
            // Use the connection
            connection.query('SELECT * FROM user', function (error, results, fields) {
              // When done with the connection, release it.
              connection.release();
          
              // Handle error after the release.
              if (error) throw error;
          
              // Don't use the connection here, it has been returned to the pool.
              console.log('Results = ', results);
              
              res.status(200).json({
                  status: 200,
                  result: results
              })
              
              pool.end((err) => {
                console.log('Pool was closed');
              });
            });
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
