require('dotenv').load();

var customerId = "";

if (process.env.CUSTOMER) {
	customerId = process.env.CUSTOMER;
} else {
	console.error("CUSTOMER environment var is not set. It must correspond to the customer ID for this QIT instance to use.");
}

var dbConfiguration;

var cloudantConfiguration;

var dbCredentialsConfiguration = {};

function initDBConnection() {
	if (process.env.CLOUDANT_R) {
		//console.log("Using env CLOUDANT_R");
		var cloudantR = JSON.parse(process.env.CLOUDANT_R);
		if(cloudantR) {
			dbCredentialsConfiguration.host = cloudantR.cloudant.host;
			dbCredentialsConfiguration.user = cloudantR.cloudant.username;
			dbCredentialsConfiguration.password = cloudantR.cloudant.password;
			dbCredentialsConfiguration.dbName = cloudantR.cloudant.db;
			dbCredentialsConfiguration.url = "https://" + dbCredentialsConfiguration.user + ":" + dbCredentialsConfiguration.password + "@" + dbCredentialsConfiguration.host;
			//console.log(dbCredentialsConfig.url);
		}
	} else {
		console.error("CLOUDANT_R environment var is not set. It needs to have credentials to the configuration DB.");
		console.error("export CLOUDANT_R=\"{\"cloudant\":{\"db\":\"databasename\",\"username\":\"username\",\"password\":\"password\",\"host\":\"hostname\"}}\"");
	}
	
	cloudantConfiguration = require('cloudant')(dbCredentialsConfiguration.url);
	
	dbConfiguration = cloudantConfiguration.use(dbCredentialsConfiguration.dbName);
}

initDBConnection();

exports.getProfile = function(cb) {
	dbConfiguration.get(customerId, { revs_info: false }, function(err, doc) {
		if (err) return cb(err);
		try {
			var profileFields = "";
			if (doc.profile_fields) {
				profileFields = doc.profile_fields;
			}
			cb(null, {profile_fields: profileFields});
		} catch (e) {
			cb(e);
		}
	});
}

exports.getConfiguration = function(cb) {
	dbConfiguration.get(customerId, { revs_info: false }, function(err, doc) {
		if (err) return cb(err);
		try {
			var profileFields = "";
			if (doc.profile_fields) {
				profileFields = doc.profile_fields;
			}
			cb(null, {
				configuration: {
					name: doc.name,
					cookie_expiration: doc.cookie_expiration,
					questions_goal: doc.questions_goal,
					question_column_width: doc.question_column_width,
					profile_fields: profileFields,
					help_text: doc.help_text
				}
			});
		} catch (e) {
			cb(e);
		}
	});
}