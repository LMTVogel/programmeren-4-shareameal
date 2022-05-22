const assert = require('assert');
const jwt = require('jsonwebtoken');

const dbconnection = require('../../database/dbconnection');
const logger = require('../../src/config/tracer_config').logger;
const jwtSecretKey = require('../config/jwt_config').secretKey;

module.exports = {
    login(req, res, next) {
        let user = req.body;
        dbconnection.getConnection((connError, conn) => {
            if (connError) {
                res.status(502).json({
                    status: 502,
                    result: "Couldn't connect to database"
                }); return;
            }
            
            if (conn) {
                // Checks if the user exists
                conn.query('SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?', user.emailAdress, (err, rows, fields) => {
                        // Releases the connection when done
                        conn.release();
                        if (err) {
                            logger.debug(err);
                            res.status(500).json({
                                status: 500,
                                message: err.toString(),
                            })
                        }

                        if (rows) {
                            // Checks the password
                            if (rows &&
                                rows.length === 1 &&
                                rows[0].password == req.body.password
                                ) 
                            {
                                logger.info('passwords DID match, sending userinfo and valid token');

                                // Extracts the password from the userdata
                                const { password, ...userinfo } = rows[0];
                                // Create an object containing the payload
                                const payload = {
                                    userId: userinfo.id,
                                }

                                jwt.sign(payload, jwtSecretKey, { expiresIn: '12d' }, function (err, token) {
                                    logger.debug('User logged in, sending: ', userinfo);
                                    res.status(200).json({
                                        status: 200,
                                        result: { ...userinfo, token },
                                    });
                                });
                            } else {
                                logger.info('User not found or password invalid');
                                res.status(404).json({
                                    status: 404,
                                    message: 'User not found or password invalid',
                                })
                            }
                        }
                    }
                )
            }
        })
    },

    validateLogin(req, res, next) {
        let user = req.body;
        // Verifies the input
        try {
            assert(typeof user.emailAdress === 'string', 'Email must be a string');
            assert(typeof user.password === 'string', 'Password must be a string');

            next();
        } catch (err) {
            res.status(400).json({
                status: 400,
                message: err.message,
            })
        }
    },

    validateToken(req, res, next) {
        logger.info('validateToken called');
        // The headers should contain the authorization-field with the value 'Bearer [token]'
        const authHeader = req.headers.authorization
        
        if (!authHeader) {
            logger.warn('Authorization header is missing');
            res.status(401).json({
                status: 401,
                message: 'Authorization header is missing',
                datetime: new Date().toISOString(),
            });
        } else {
            // Removes the word 'Bearer ' from the headervalue
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    logger.warn('Not authorized');
                    res.status(401).json({
                        status: 401,
                        message: 'Not authorized',
                    })
                } else if (payload) {
                    logger.debug('token is valid', payload)
                    // User has access, adds UserId from payload to the request
                    req.userId = payload.userId
                    next()
                }
            })
        }
    },
}