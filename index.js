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

router.get("/:id/personal", (req, res) => {
    axios.get("https://api.intra.42.fr/v2/users/" + req.params.id, {
        headers: {
            Authorization: `Bearer ${req.session.token}`
        }
    }).then(response => {
        return (res.json({
            id: response.data.id,
            email: response.data.email,
            login: response.data.login,
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            phone: response.data.phone
        }));
    }).catch(err => {
        return (res.send(err.data));
    });
});

router.get("/:id/skillsexpertises", (req, res) => {
    axios.get("https://api.intra.42.fr/v2/users/" + req.params.id, {
        headers: {
            Authorization: `Bearer ${req.session.token}`
        }
    }).then(response => {
        let data = response.data;
        let skills = {};
        let expertises = {};

        data.cursus_users.filter(cursus => cursus.skills && cursus.skills[0]).forEach(cursus => {
            skills[cursus.cursus.name] = cursus.skills;
        });
        expertises = data.expertises_users;
        return (res.send({skills: skills, expertises: expertises}));
    }).catch(err => {
        return (res.send(err.data));
    });
});

router.get("/:id/record", (req, res) => {
    axios.get("https://api.intra.42.fr/v2/me", {
        headers: {
            Authorization: `Bearer ${req.session.token}`
        }
    }).then(response => {
        let data = response.data;
        let marks = {};

        data.projects_users.filter(project => project.status == "finished").forEach(project => {
            marks[project.project.slug] = project.final_mark;
        });
        return (res.send(marks));
    }).catch(err => {
        return (res.send(err.data));
    });
});

app.use("/", router);
app.listen(8080, () => {
    console.log("Server is running on port 8080.")
});