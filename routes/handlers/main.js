var configuration = require("../../lib/configuration.js");

var customer = "";
configuration.getConfiguration(function(err, doc) {
	if (err) {
		console.error(err.stack);
	} else {
		console.log(doc.configuration.name);
		customer = doc.configuration.name;
	}
});

exports.home = function(req, res){
	res.render("home", { customer: customer });
};

exports.login = function(req, res){
	res.render("login", { customer: customer });
};

exports.loginError = function(req, res){
	res.render("login", { customer: customer, error: "The username and password provided are incorrect, please try again" });
};

exports.logout = function(req, res){
    req.logout();
    res.redirect('/login');
};

exports.admin = function(req, res){
	res.render("admin", { customer: customer, user: req.user });
};
