const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        //1. get the token
        const token = req.header("Authorization");
        if (!token) return res.status(401).send("Unauthorized. token is missing");

        //2. verify token
        const payload = jwt.verify(token, process.env.jwtKey);

        //3. save the payload
        req.payload = payload

        next();
    } catch (error) {
        res.status(400).send(error)
    }
}