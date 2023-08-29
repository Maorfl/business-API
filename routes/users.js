const express = require("express");
const joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const auth = require("../middlewares/auth");
const User = require("../models/User");

const router = express.Router();

const loginSchema = joi.object({
    email: joi.string().required().email(),
    password: joi.string().required().min(8).regex(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/)
});

const userJoiSchema = joi.object({
    name: {
        first: joi.string().required().min(2),
        middle: joi.string().min(2),
        last: joi.string().required().min(2)
    },
    phone: joi.string().required().min(4).max(13),
    email: joi.string().required().email(),
    password: joi.string().required().min(8).regex(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/),
    address: {
        state: joi.string().min(2),
        country: joi.string().required().min(2),
        city: joi.string().required().min(2),
        street: joi.string().required().min(2),
        houseNumber: joi.number().required().min(0)
    },
    image: {
        url: joi.string(),
        alt: joi.string()
    },
    gender: joi.string(),
    userType: joi.string().required()
});

router.post("/", async (req, res) => {
    try {
        const { error } = userJoiSchema.validate(req.body);
        if (error) return res.status(400).send(error);

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send("User already exists!");

        user = new User(req.body);

        let salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();

        const token = jwt.sign({ _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, isBusiness: user.isBusiness }, process.env.jwtKey);

        res.status(201).send(token);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/login", async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).send(error);

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).send("User does not exist!");

        const result = bcrypt.compare(req.body.password, user.password);
        if (!result) return res.status(400).send("Wrong email or password!");

        const token = jwt.sign({ _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, gender: user.gender, userType: user.userType }, process.env.jwtKey);

        res.status(200).send(token);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/", async (req, res) => {
    try {
        let users = await User.find();
        if (!users) return res.status(404).send("No users available!");

        users = _.map(users, (user) => _.pick(user, ["_id", "name", "email", "phone", "address", "image", "gender", "userType"]));

        res.status(200).send(users);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/:id", auth, async (req, res) => {
    try {
        if (req.payload._id != req.params.id || req.payload.userType != "admin") return res.status(400).send("User must be singed in or an Admin!");

        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).send("User does not exist!");

        res.status(200).send(_.pick(user, ["_id", "name", "email", "phone", "isBusiness", "address", "image", "gender", "userType"]));
    } catch (error) {
        res.status(400).send(error);
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        const { error } = User.validate(req.body);
        if (error) return res.status(400).send(error);

        let user = await User.findOneAndUpdate(
            {
                _id: req.params.id
            },
            req.body,
            { new: true }
        );

        if (!user) return res.status(404).send("User does not exists!");

        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.patch("/:id", auth, async (req, res) => {
    try {
        let user = await User.findOne({ _id: req.params.id });
        if (!user) return res.status(404).send("User does not exist!");

        user.userType = req.body.userType;
        await user.save();

        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        let user = await User.findByIdAndDelete({ _id: req.params.id });
        if (!user) return res.status(404).send("User does not exist!");

        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
})

module.exports = router;