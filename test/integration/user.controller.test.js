const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
require("dotenv").config();
const dbconnection = require("../../database/dbconnection");
const logger = require('../../src/config/tracer_config').logger;

const testToken = process.env.JWT_TEST_TOKEN;

// SQL queries for testing purposes
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;
const INSERT_USER_1 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "d.ambesi@avans.nl", "secret", "street", "city");';

const INSERT_USER_2 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`,  `isActive`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(2, "test", "test", 1, "test@server.com", "$2a$10$TWAvlgLc/KB8A0J/PGNBQeUkzwFrRE1gP0oS9owPI9.PEBTTPTtMO", "test", "test");';

chai.should();
chai.use(chaiHttp);

describe("Manage users api/user", () => {
    describe('UC-101 Login', () => {
        beforeEach((done) => {
            //Connects to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empties the database for testing
                conn.query(CLEAR_DB, function (dbError, results, fields) {
                        // Releases the connection when finnished
                        conn.release();

                        // Handles the error after the release
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        it('TC-101-1 When a required input is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/auth/login').auth(testToken, { type: 'bearer' }).send({
                emailAdress: "j.doe@server.com",
                //Password is missing
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(400);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');

                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string').that.equals('Password must be a string');
                
                done();
            });
        });

        it('TC-101-2 When a non-valid email is used, a valid error should be returned', (done) => {
            chai.request(server).post('/api/auth/login').auth(testToken, { type: 'bearer' }).send({
                //Email is not a string
                emailAdress: 45656456,
                password: "verySecr3t"
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(400);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');

                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string').that.equals('Email must be a string');
                
                done();
            });
        });

        it('TC-101-3 When a non-valid password is used, a valid error should be returned', (done) => {
            chai.request(server).post('/api/auth/login').auth(testToken, { type: 'bearer' }).send({
                emailAdress: "j.doe@server.com",
                //Password is not a string
                password: 45564456
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(400);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');

                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string').that.equals('Password must be a string');
                
                done();
            });
        });

        it(`TC-101-4 If the user doesn't exist, a valid message should be returned`, (done) => {
            chai.request(server).post('/api/auth/login').auth(testToken, { type: 'bearer' }).send({
                emailAdress: "thisUserDoesnt@exist.com",
                password: "verySecr3t"
            })
            .end((err, res) => {
                assert.ifError(err);
    
                res.should.have.status(404);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');
    
                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string').that.equals('User not found or password invalid');
                
                done();
            });
        });
    
        it(`TC-101-5 User succesfully logged in`, (done) => {
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;
    
                //Empties database for testing
                conn.query(CLEAR_DB + INSERT_USER_1, function (dbError, results, fields) {
                        // Releases the connection when finnished
                        conn.release();
    
                        // Handles the error after the release
                        if (dbError) throw dbError;
    
                        chai.request(server).post('/api/auth/login').auth(testToken, { type: 'bearer' }).send({
                            emailAdress: "d.ambesi@avans.nl",
                            password: "secret"
                        })
                        .end((err, res) => {
                            assert.ifError(err);
                
                            res.should.have.status(200);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'result');
                
                            let { status, result } = res.body;
                            status.should.be.a('number');
                            result.should.be.an('object').that.includes.keys('id', 'emailAdress', 'firstName', 'lastName', 'token');
                            
                            done();
                        });
                    }
                )
            });
        });
    });

    describe("UC-201 add user", () => {
        beforeEach((done) => {
            //Connects to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empties database for testing
                conn.query(CLEAR_DB, function (dbError, results, fields) {
                        // Releases the connection when finnished
                        conn.release();

                        // Handles the error after the release
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        it('TC 201-1 When a required input is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').auth(testToken, { type: 'bearer' }).send({
                //Firstname is missing
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                isActive: true,
                emailAdress: "j.doe@server.com",
                phoneNumber: "+31612345678",
                password: "verySecr3t"
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(400);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');

                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string').that.equals('Firstname must be a string');
                
                done();
            });
        });

        it('TC 201-2 If the email is invalid, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').auth(testToken, { type: 'bearer' }).send({
                firstName: "John",
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                isActive: true,
                emailAdress: "test@testcom",
                phoneNumber: "+31612345678",
                password: "secret"
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(400);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');

                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string').that.equals('Email is not valid');
                
                done();
            });
        });

        it('TC 201-3 If the password is invalid, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').auth(testToken, { type: 'bearer' }).send({
                firstName: "John",
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                isActive: true,
                emailAdress: "j.doe@server.com",
                phoneNumber: "+31612345678",
                password: "secret"
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(400);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');

                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string').that.equals('Password must contain at least one uppercase letter, one number and be 8 characters long');
                
                done();
            });  
        });

        it('TC 201-4 If the email is already in use, a valid error should be returned', (done) => {
            // Connects to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empties database for testing
                conn.query(INSERT_USER_1, function (dbError, results, fields) {
                        // Releases the connection when finnished
                        conn.release();

                        // Handles the error after the release
                        if (dbError) throw dbError;

                        chai.request(server).post('/api/user').auth(testToken, { type: 'bearer' }).send({
                            firstName: 'first',
                            lastName: "last",
                            street: "street",
                            city: "city",
                            isActive: true,
                            emailAdress: "d.ambesi@avans.nl",
                            phoneNumber: "+31646386382",
                            password: "verySecr3t"
                        })
                        .end((err, res) => {
                            assert.ifError(err);
            
                            res.should.have.status(409);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'message');
            
                            let { status, message } = res.body;
                            status.should.be.a('number');
                            message.should.be.a('string').that.equals('Email is already used');
                            
                            done();
                        });
                    }
                )
            });
        });

        it('TC 201-5 A user was added succesfully', (done) => {
            chai.request(server).post('/api/user').auth(testToken, { type: 'bearer' }).send({
                firstName: "first",
                lastName: "last",
                street: "street",
                city: "city",
                isActive: true,
                emailAdress: "email@server.nl",
                phoneNumber: "+31635368583",
                password: "verySecr3t"
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(201);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.an('object').that.includes.keys('id', 'firstName', 'lastName', 'isActive', 'emailAdress', 'password', 'phoneNumber', 'street', 'city');
                
                done();
            });
        });
    });

    describe('UC-202 get all users', () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_DB + INSERT_USER_1 + INSERT_USER_2, function (dbError, results, fields) {
                        // When done with the connection, release it.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        it('TC-202-1 Should return zero users', (done) => {
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                // Empties the database
                conn.query(CLEAR_DB, function (dbError, results, fields) {
                        // Releases the connection when finnished
                        conn.release();

                        chai.request(server).get('/api/user').auth(testToken, { type: 'bearer' })
                        .end((err, res) => {
                            // Handles the error after the release
                            if (dbError) throw dbError;

                            res.should.have.status(200);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'result');

                            let { status, result } = res.body;
                            status.should.be.a('number');
                            result.should.be.an('array').that.is.empty;
                            
                            done();
                        });
                    }
                )
            });
        });

        it('TC-202-2 Should return a list of 2 users', (done) => {
            chai.request(server).get('/api/user').auth(testToken, { type: 'bearer' })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.an('array');
                result.should.have.lengthOf(2);
                for(user of result) {
                    user.should.include.all.keys('id', 'firstName', 'lastName', 'isActive', 'emailAdress', 'phoneNumber', 'roles', 'street', 'city');
                }

                done();
            });
        });

        it("UC-202-3 Should return an empty list by searching for an non-existing name", (done) => {
            chai.request(server).get('/api/user?firstName=nonExistingFirstName&lastName=nonExistingLastName').auth(testToken, { type: 'bearer' })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.an('array').that.is.empty;
                
                done();
            });
        });
    
        it("UC-202-4 Should return a list of user filtered by non-active status", (done) => {
            chai.request(server).get('/api/user?isActive=0').auth(testToken, { type: 'bearer' })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.an('array').that.is.empty;
                
                done();
            });     
        });

        it("UC-202-5 Should return a list of user filtered by active status", (done) => {
            chai.request(server).get('/api/user?isActive=1').auth(testToken, { type: 'bearer' })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.an('array').that.has.a.lengthOf(2);
                
                done();
            });
        });

        it("UC-202-6 Should return a list by searching for an existing name", (done) => {
            chai.request(server).get('/api/user?firstName=test&lastName=test').auth(testToken, { type: 'bearer' })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.an('array').that.has.a.lengthOf(1);
                
                done();
            });
        });
    });

    describe('UC-204 get a user by id', () => {
        beforeEach((done) => {
            // Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                // Clear the database for testing
                conn.query(CLEAR_DB + INSERT_USER_1, function (dbError, results, fields) {
                        // When done with the connection, release it
                        conn.release();

                        // Handle error after the release
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        it(`TC-204-2 If the user doesn't exist, a valid error should be returned.`, (done) => {
            chai.request(server).get('/api/user/0')
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(404);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');

                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string').that.contains('User does not exist');

                done();
            });
        });

        it('TC-204-3 User exists and returns the correct keys', (done) => {
            chai.request(server).get('/api/user/1')
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.a('object');
                result.should.include.all.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'password', 'roles');

                done();
            });
        });
    });
});