const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
require("dotenv").config();
const dbconnection = require("../../database/dbconnection");

// SQL queries for testing purposes
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;
const INSERT_USER_1 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "d.ambesi@avans.nl", "secret", "street", "city");';

chai.should();
chai.use(chaiHttp);

describe("Manage users api/user", () => {
    describe("UC-201 add user", () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_DB, function (dbError, results, fields) {
                        // Release connection after no more further action.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        it('TC 201-1 When a required input is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                //Firstname is missing
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
                message.should.be.a('string').that.contains('First name must be a string');
                
                done();
            });
        });

        it('TC 201-4 If the email is already in use, a valid error should be returned', (done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(INSERT_USER_1, function (dbError, results, fields) {
                        // Release connection after no more further action.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        chai.request(server).post('/api/user').send({
                            firstName: 'first',
                            lastName: "last",
                            street: "street",
                            city: "city",
                            isActive: true,
                            emailAdress: "d.ambesi@avans.nl",
                            phoneNumber: "+31646386382",
                            password: "secret"
                        })
                        .end((err, res) => {
                            assert.ifError(err);
            
                            res.should.have.status(409);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'message');
            
                            let { status, message } = res.body;
                            status.should.be.a('number');
                            message.should.be.a('string').that.contains('Email is already being used by another user');
                            
                            done();
                        });
                    }
                )
            });
        });

        it('TC 201-5 A user was added succesfully', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "first",
                lastName: "last",
                street: "street",
                city: "city",
                isActive: true,
                emailAdress: "email@server.nl",
                phoneNumber: "+31635368583",
                password: "secret"
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(201);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.an('object').that.includes.keys('firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'password');
                
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