var rest = require("connect-rest");

var api = require("./handlers/api");

module.exports = function(app) {

	var apiOptions = {
		context: "/api",
		domain: require("domain").create(),
	}
	app.use(rest.rester(apiOptions));
	
	rest.get("/profile", api.getProfile);
	rest.get("/configuration", api.getConfiguration);
	rest.get("/question/:id", api.getQuestion);
	rest.post("/save", api.saveQuestion);
	
	rest.get("/questions", api.getQuestions);
	rest.post("/deletequestions", api.deleteQuestions);
};