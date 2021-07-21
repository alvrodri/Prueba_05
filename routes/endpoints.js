const axios = require("axios");

module.exports = router => {
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
}