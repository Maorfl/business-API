const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        first: {
            type: String,
            required: true,
            minLength: 2
        },
        middle: {
            type: String,
            minLength: 2
        },
        last: {
            type: String,
            required: true,
            minLength: 2
        }
    },
    phone: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 13
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    address: {
        state: {
            type: String,
            minLength: 2
        },
        country: {
            type: String,
            required: true,
            minLength: 2
        },
        city: {
            type: String,
            required: true,
            minLength: 2
        },
        street: {
            type: String,
            required: true,
            minLength: 2
        },
        houseNumber: {
            type: Number,
            required: true
        }
    },
    image: {
        url: {
            type: String
        },
        alt: {
            type: String
        }
    },
    gender: {
        type: String
    },
    userType: {
        type: String
    }
});

const User = mongoose.model("users", userSchema);

module.exports = User;