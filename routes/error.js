module.exports = function(app) {

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		var err = new Error("Not Found");
		err.status = 404;
		res.status(err.status);
		res.render("error", {
			layout: "error",
			status: err.status,
			message: err.message
		});
	});

	// error handlers

	// development error handler
	// will print stacktrace
	if (app.get("env") === "development") {
		app.use(function(err, req, res, next) {
			console.log("dev error");
			res.status(err.status || 500);
			res.render("error", {
				layout: "error",
				status: err.status,
				message: err.message,
				error: err
			});
		});
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
		console.log("prod error");
		res.status(err.status || 500);
		res.render("error", {
			message: err.message
		});
	});

	/*
	// custom 404
	app.use(function(req, res) {
		res.status(404);
		res.render("404", {layout: "error"});
	});
	
	// custom 500
	app.use(function (err, req, res, next) {
		console.error(err.stack);
		res.status(500);
		res.render("500", {layout: "error"});
	});
	*/
	
};

