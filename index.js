const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

mongoose
    .connect(process.env.DB, { useNewUrlParser: true })
    .then((res) => console.log("MongoDB connected"))
    .catch((error) => console.log(error));



app.listen(port, () => console.log("Server started on port", port));