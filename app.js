/*eslint-env node*/

/**
 * Module dependencies.
 */
var express = require("express");
var expressSession = require('express-session');
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var favicon = require("serve-favicon");
var handlebars = require("express-handlebars");
var logger = require("morgan");
var methodOverride = require('method-override');
var multer = require('multer');
var path = require("path");
require('dotenv').load();

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

/**
 * App configuration
 */
var app = express();
// app.get('/admin', function(req, res) {
//     res.redirect('https://obqitadmin.mybluemix.net/admin');
// });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.engine("hbs", handlebars({extname:"hbs", defaultLayout:"main.hbs"}));
app.set("view engine", "hbs");



// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + "/public/favicon.ico"));
//app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(expressSession({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

/**
 * Site routes
 */
var routes = require("./routes/site")(app);


/**
 * API routes
 */
var api = require("./routes/api")(app);


/**
 * Error routes
 */
var error = require("./routes/error")(app);

// start server on the specified port and binding host
app.listen(appEnv.port, function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
