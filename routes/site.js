var main = require("./handlers/main");
var users = require("../lib/users");

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

/**
 * Passport configuration
 */
passport.use(new LocalStrategy(
	function(username, password, done) {
		//console.log("LocalStrategy");
		users.findByUsername(username, function (err, user) {
			//console.log(user);
			if (err) { return done(err); }
			if (!user) { return done(null, false); }
			if (user.password != password) { return done(null, false); }
			return done(null, user);
		});
	}
));

passport.serializeUser(function(user, cb) {
	//console.log("serializeUser", user);
	cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
	//console.log("deserializeUser", id);
	users.findById(id, function (err, user) {
		if (err) { return cb(err); }
		cb(null, user);
	});
});

module.exports = function(app) {

	// Initialize Passport authentication
	app.use(passport.initialize());
	app.use(passport.session());

	app.get("/", main.home);
	
	app.get("/login", main.login);
	app.get("/loginError", main.loginError);
	app.post("/login", 
		passport.authenticate("local", { failureRedirect: "/loginerror" }),
		function(req, res) {
			res.redirect("/admin");
		});
	app.get("/logout", main.logout);

	app.get("/admin", main.admin);
	
};




