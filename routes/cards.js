const express = require("express");
const joi = require("joi");
const _ = require("lodash");
const auth = require("../middlewares/auth");
const Card = require("../models/Card");

const router = express.Router();

const cardJoiSchema = joi.object({
    title: joi.string().required().min(2),
    subtitle: joi.string().required().min(2),
    description: joi.string().required().min(2),
    phone: joi.string().required().min(4).max(13),
    email: joi.string().required().email(),
    web: joi.string(),
    image: {
        url: joi.string(),
        alt: joi.string()
    },
    address: {
        state: joi.string().min(2),
        country: joi.string().required().min(2),
        city: joi.string().required().min(2),
        street: joi.string().required().min(2),
        houseNumber: joi.number().required().min(0),
        zip: joi.string()
    },
    userId: joi.string(),
    favoriteByUsers: joi.array()
});


router.get("/", async (req, res) => {
    try {
        let cards = await Card.find();
        if (!cards) return res.status(404).send("No cards available!");

        cards = _.map(cards, (card) => _.pick(card, ["_id", "title", "subtitle", "description", "phone", "email", "web", "image", "address"]));

        res.status(200).send(cards);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/my-cards", auth, async (req, res) => {
    try {
        let cards = await Card.find({ _id: req.payload._id });
        if (!cards) return res.status(404).send("No cards available!");

        cards = _.map(cards, (card) => _.pick(card, ["_id", "title", "subtitle", "description", "phone", "email", "web", "image", "address"]));

        res.status(200).send(cards);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/:id", async (req, res) => {
    try {
        let card = await Card.findOne({ _id: req.params.id });
        if (!card) return res.status(404).send("Card does not exist!");

        res.status(200).send(_.pick(["_id", "title", "subtitle", "description", "phone", "email", "web", "image", "address"]));
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/", async (req, res) => {
    try {
        const { error } = cardJoiSchema.validate(req.body);
        if (error) return res.status(400).send("Meow");

        let card = new Card(req.body);

        res.status(201).send(card);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        const { error } = cardJoiSchema.validate(req.body);
        if (error) return res.status(400).send(error);

        let card = await Card.findOneAndUpdate(
            {
                _id: req.params.id
            },
            req.body,
            { new: true }
        );

        if (!card) return res.status(404).send("Card does not exist!");

        res.status(200).send(card);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.patch("/:id", auth, async (req, res) => {
    try {
        let card = await Card.findOne({ _id: req.params.id });
        if (!card) return res.status(404).send("Card does not exist!");

        card.favoriteByUsers.push(req.payload._id);
        await card.save();

        res.status(200).send(card);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        let card = await Card.findOneAndDelete({ _id: req.params.id });
        if (!card) return res.status(404).send("Card does not exist!");

        res.status(200).send(card);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;