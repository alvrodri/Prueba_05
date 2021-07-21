const express = require("express");
const axios = require("axios");
const cors = require("cors");
const session = require("express-session");
const config = require("dotenv").config();

const OAuth2 = require("client-oauth2");
const auth = new OAuth2({
	clientId: process.env.UID,
	clientSecret: process.env.SECRET,
	accessTokenUri: process.env.ACCESS_TOKEN_URI,
	authorizationUri: process.env.AUTHORIZATION_URI,
	redirectUri: process.env.REDIRECT_URI
});

const app = express();
const router = express.Router();

app.use(cors());
app.use(session({
	secret: "1234567890ALVARO",
	resave: true,
	saveUninitialized: false
}));

router.use((req, res, next) => {
    if (!req.session.token && req.path != "/auth") {
        return (res.redirect("https://api.intra.42.fr/oauth/authorize?client_id=e4687b12250f5e85bc2323ac61bd9b35773f281b57596ef28d900356ff6d078d&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fauth&response_type=code"));
    } else {
        return (next());
    }
});

router.get("/", (req, res) => {
    return (res.send(""));
});

router.get("/auth", (req, res) => {
    auth.code.getToken(req.originalUrl).then(user => {
        user.refresh().then(user => {
            req.session.refresh = user.data.refresh_token;
            req.session.token = user.accessToken;
            req.expires_in = user.data.expires_in;
            req.session.created_at = user.data.created_at;
            return res.status(200).send("OK");
        });
    }).catch(err => {
		return (res.send(err.data));
	});
});

require("./routes/endpoints")(router);

app.use("/", router);
app.listen(8080, () => {
    console.log("Server is running on port 8080.")
});