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
            emailAdress,
            phoneNumber,
            password,
        } = user;

        try {
            assert(typeof firstName === 'string', 'First name must be a string');
            assert(typeof lastName === 'string', 'Last name must be a string');
            assert(typeof street === 'string', 'Street must be a string');
            assert(typeof city === 'string', 'City must be a string');
            assert(typeof isActive === 'boolean', 'IsActive must be a boolean');
            assert(typeof emailAdress === 'string', 'Email address must be a string');
            assert(typeof phoneNumber === 'string', 'Phone number must be a string');
            assert(typeof password === 'string', 'Password must a string');

            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message,
            };

            next(error);
        }
    },
    addUser: (req, res) => {
        let user = req.body;
        dbconnection.getConnection(function(connError, conn) {
            //Not connected
            if (connError) {
                res.status(502).json({
                    status: 502,
                    result: "Couldn't connect to database"
                }); return;
            }

            //Check if the email is valid
            if(!emailValidator.validate(user.emailAdress)) {
                res.status(400).json({
                    status: 400,
                    message: "Email is not valid"
                }); return;
            }

            //Check if the password is valid
            const passwordRegex = /(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/gm
            if(!passwordRegex.test(user.password)) {
                res.status(400).json({
                    status: 400,
                    message: "Password must contain at least one uppercase letter, one number and be 8 characters long"
                }); return;
            }

            //Insert the user object into the database
            conn.query(`INSERT INTO user SET ?`, user, function (dbError, result, fields) {
                // When done with the connection, release it.
                conn.release();

                // Handle error after the release.
                if(dbError) {
                    logger.debug(dbError);
                    if(dbError.errno == 1062) {
                        res.status(409).json({
                            status: 409,
                            message: "Email is already used"
                        });
                    } else {
                        logger.error(dbError);
                        res.status(500).json({
                            status: 500,
                            result: "Error"
                        });
                    }
                } else {
                    res.status(201).json({
                        status: 201,
                        result: {
                            id: result.insertId,
                            ...user
                        }
                    });
                }
            });
        });
    },
    getAllUsers: (req, res) => {
        let {id, firstName, lastName, street, city, isActive, emailAdress, phoneNumber} = req.query;

        if(!id) { id = '%'}
        if(!firstName) { firstName = '%' }
        if(!lastName) { lastName = '%' }
        if(!street) {street = '%' }
        if(!city) { city = '%' }
        if(!isActive) { isActive = '%' }
        if(!emailAdress) { emailAdress = '%' }
        if(!phoneNumber) { phoneNumber = '%'}

        dbconnection.getConnection(function(connError, conn) {
            //Not connected
            if (connError) {
                res.status(502).json({
                    status: 502,
                    result: "Couldn't connect to database"
                }); return;
            }
            
            conn.query(`SELECT id, firstName, lastName, isActive, emailAdress, phoneNumber, roles, street, city 
            FROM user WHERE id LIKE ? AND firstName LIKE ? AND lastName LIKE ? AND street LIKE ? AND city LIKE ? AND isActive LIKE ? AND emailAdress LIKE ? AND phoneNumber LIKE ?`,
            [id, '%' + firstName + '%', '%' + lastName + '%', '%' + street + '%', '%' + city + '%', isActive, '%' + emailAdress + '%', '%' + phoneNumber + '%'], function (dbError, results, fields) {
                // When done with the connection, release it.
                conn.release();
                
                // Handle error after the release.
                if (dbError) {
                    if(dbError.errno === 1064) {
                        res.status(400).json({
                            status: 400,
                            message: "Something went wrong with the filter URL"
                        }); return;
                    } else {
                        logger.error(dbError);
                        res.status(500).json({
                            status: 500,
                            result: "Error"
                        }); return;
                    }
                }
                
                res.status(200).json({
                    status: 200,
                    result: results
                });
            });
        });   
    },
    getUserById: (req, res, next) => {
        const userId = req.params.id;
        dbconnection.getConnection(function(connError, conn) {
            // No connection for databases
            if (connError) {
                res.status(502).json({
                    status: 502,
                    result: "Couldn't connect to database"
                }); 
                
                return;
            }
            
            conn.query('SELECT * FROM user WHERE id = ' + userId, function (dbError, results, fields) {
                // When done with the connection, release it.
                conn.release();
                
                // Handle error after the release.
                if (dbError) {
                    console.log(dbError);
                    res.status(500).json({
                        status: 500,
                        result: "Error"
                    }); return;
                }
                
                const result = results[0];
                if(result) {
                    res.status(200).json({
                        status: 200,
                        result: result
                    });
                } else {
                    res.status(404).json({
                        status: 404,
                        message: "User does not exist"
                    });
                }
            });
        });
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
