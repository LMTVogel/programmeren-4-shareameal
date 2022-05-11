require('dotenv').config();
const express = require("express");
const app = express();
const port = process.env.PORT;

const bodyParser = require("body-parser");
const { get } = require("express/lib/response");
const router = require("./src/routes/user.routes");

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
    const method = req.method;
    console.log(`Method ${method} is aangeroepen`);
    next();
});

app.use(router);

app.all("*", (req, res) => {
    res.status(404).json({
        status: 404,
        result: "Endpoint not found",
    });
});

// Error handling
app.use((err, req, res, next) => {
    res.status(err.status).json(err);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

module.exports = app;
