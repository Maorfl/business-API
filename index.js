const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const users = require("./routes/users");
const cards = require("./routes/cards");
const logger = require("morgan");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

mongoose
    .connect(process.env.DB, { useNewUrlParser: true })
    .then((res) => console.log("MongoDB connected"))
    .catch((error) => console.log(error));


app.use(logger("combined"));
app.use(express.json());
app.use(cors());

app.use("/api/users", users);
app.use("/api/cards", cards);

app.listen(port, () => console.log("Server started on port", port));