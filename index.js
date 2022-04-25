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

// Registers a new user in the database
app.post("/api/user", (req, res) => {
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
});

app.all("*", (req, res) => {
    res.status(401).json({
        status: 401,
        result: "End-point not found",
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
