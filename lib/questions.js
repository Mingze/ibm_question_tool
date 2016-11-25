var customerId = "";

if (process.env.CUSTOMER) {
	customerId = process.env.CUSTOMER;
} else {
	console.error("CUSTOMER environment var is not set. It must correspond to the customer ID for this QIT instance to use.");
}

var dbConfiguration;
var dbQuestions;

var cloudantConfiguration;
var cloudantQuestions;

var dbCredentialsConfiguration = {};
var dbCredentialsQuestions = {};

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
	
	dbConfiguration.get(customerId, { revs_info: false }, function(err, doc) {
		if (err) {
			console.error("Failed to get customer configuration doc");
			console.error(err);
		}
		try {
			dbCredentialsQuestions.host = doc.questions_db.host;
			dbCredentialsQuestions.user = doc.questions_db.username;
			dbCredentialsQuestions.password = doc.questions_db.password;
			dbCredentialsQuestions.dbName = doc.questions_db.db;
			dbCredentialsQuestions.url = "https://" + dbCredentialsQuestions.user + ":" + dbCredentialsQuestions.password + "@" + dbCredentialsQuestions.host;
			
			cloudantQuestions = require('cloudant')(dbCredentialsQuestions.url);
			
			dbQuestions = cloudantQuestions.use(dbCredentialsQuestions.dbName);
		} catch (e) {
			console.error("Failed to initialize questions DB connection");
			console.error(e);
		}
	});
}

initDBConnection();

exports.getQuestion = function(id, cb) {
	
	dbQuestions.get(id, { revs_info: false }, function(err, doc) {
		if (err) return cb(err);
		var data = {
			questions: doc.questions,
			profile_fields: doc.profile_fields
		}
		cb(null, data);
	});
}

exports.saveQuestion = function(id, question, profileFields, name, email,  team, duplicate, cb) {
	id=false;
	var timestamp= new Date();
		timestamp=timestamp.toLocaleDateString()+" "+timestamp.toLocaleTimeString();

	console.log("in saveQuestion!"+timestamp);
	if (id) {
		//console.log("id", id);
		
		dbQuestions.get(id, { revs_info: false }, function(err, doc) {
			if (err) {
				
				var doc = {
					customer_id: customerId,
					questions: [question],
					profile_fields: profileFields,
					name: name,
					email:email,
					timestamp:timestamp,
					team:team,
					duplicate:duplicate
				}
				
				dbQuestions.insert(doc, function(err, doc) {
					if (err) return cb(err);
					cb(null, doc);
				});
			} else {
				//console.log("doc found", doc);
				var questions = doc.questions;
				if (questions) {
					questions.push(question);
				} else {
					questions = [question];
				}
				var docUpdate = {
					_id: doc._id,
					_rev: doc._rev,
					customer_id: doc.customer_id,
					questions: questions,
					profile_fields: profileFields,
					name: name,
					email:email,
					timestamp:timestamp,
					team: team,
					duplicate:duplicate

				}
				
				//console.log("updated doc", docUpdate);
				dbQuestions.insert(docUpdate, id, function(err, doc) {
					if (err) return cb(err);
					cb(null, doc);
				});
			}
		});
	} else {
		/*profileFields.forEach(function(field) {
			console.log(field.id, field.value);
		});*/
		var doc = {
			customer_id: customerId,
			questions: [question],
			profile_fields: profileFields,
			name: name,
			email:email,
			timestamp:timestamp,
			team: team,
			duplicate:duplicate
		}
		
		dbQuestions.insert(doc, function(err, doc) {
			if (err) return cb(err);
			cb(null, doc);
		});
	}
}

exports.getQuestions = function(cb) {
	var design = "ux";
	var view = "byCustomer";
	var qparams = {key: customerId};
	
	dbQuestions.view(design, view, qparams, function(err, result) {
		if (err) return cb(err);
		var questions = [];
		var count = 0;
		result.rows.forEach(function(row) {
			var userQuestions = row.value[0];
			if (userQuestions) {
				userQuestions.forEach(function(question) {
					questions.push({
						id: row.id,
						question: question,
						profile_fields: row.value[1]
					});
					count++;
				});
			}
		});
		cb(null, {count: count, questions: questions});
	});
}

exports.deleteQuestions = function(questions, cb) {
	try {
		if (questions) {
			var questionsArr = JSON.parse(questions);
			var questionsToDelete = {};
			questionsArr.forEach(function(question) {
				if (!questionsToDelete[question.question_id]) {
					var q = {};
					q[question.question] = 1;
					questionsToDelete[question.question_id] = q;
				} else {
					questionsToDelete[question.question_id][question.question] = 1;
				}
			});
			
			var questionIds = Object.keys(questionsToDelete);
			dbQuestions.fetch({keys: questionIds}, function (err, result) {
				if (err) return cb(err);
				try {
					var questionDocs = [];
					result.rows.forEach(function(row) {
						var doc = row.doc;
						//console.log("before", doc.questions);
						if (questionsToDelete[doc._id]) {
							var questionsToKeep = [];
							row.doc.questions.forEach(function(question) {
								if (!questionsToDelete[doc._id][question]) {
									questionsToKeep.push(question);
								}
							});
							//console.log("after", questionsToKeep);
							doc.questions = questionsToKeep;
						}
						questionDocs.push(doc);
					});
					
					dbQuestions.bulk({docs: questionDocs}, function(err, result) {
						if (err) return cb(err);
						cb(null, result);
					});
				} catch(e) {
					cb(e);
				}
			});
		}
	} catch(e) {
		cb(e);
	}
}