var authEndpoint = '/auth/check';
//Get answers through Retrieve and Rank service
function checkCredentials(form) {
    document.getElementById("wrgCreds").className = "wrongCreds";
    var userCreds = {
        reqPass: form.password.value
    }

    if (userCreds.reqPass == "ibmwatson") {
        var sessionTimeout = 0.5; //hours
		var loginDuration = new Date();
        loginDuration.setTime(loginDuration.getTime() + (sessionTimeout * 60 * 60 * 1000));
        document.cookie = "CrewCentreSession2=Valid; " + loginDuration.toGMTString() + "; path=/";
        location = "/";
        
    } else {
        document.getElementById("wrgCreds").className = "wrongCredsShow";
    }

}