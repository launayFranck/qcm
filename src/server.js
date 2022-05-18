// • Modules imports
const express = require("express");
const app = express();
require('dotenv').config();

// • Server config
app.use(express.json());

// • Server routes
app.get("/", (req, res) => {
    res.send("Hello world!");
});

// • Server launching
app.listen(process.env.PORT, () => console.log(`App started on http://localhost:${process.env.PORT}`));