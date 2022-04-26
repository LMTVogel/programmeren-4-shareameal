const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
let database = [];

chai.should();
chai.use(chaiHttp);

describe("UC-naam", () => {
    describe("Testcase naam van use case naam", () => {
        beforeEach((done) => {
            database = [];
            done();
        });

        it("When a required input is missing, a valid error should be returned", (done) => {
            chai.request(server)
                .post("/api/user")
                .send({
                    // firstName is missing on purpose to test
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    isActive: true,
                    emailAddress: "luuk@gmail.com",
                    phoneNumber: "0640942644",
                    password: "secret",
                })
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(400);
                    result.should.be
                        .a("string")
                        .that.equals("First name must be a string");

                    done();
                });
        });
    });
});
