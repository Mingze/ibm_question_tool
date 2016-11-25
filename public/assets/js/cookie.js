if (document.cookie.indexOf("CrewCentreSession2=Valid") == -1) {
    console.log("je ne suis pas authentifié!!!");
  	location= "../../login.html";
} else {
    console.log(document.cookie);
}

function logout(){
	document.cookie = "CrewCentreSession2=unValid; -1; path=/";
    console.log('je me deconnecte');
  	location.reload();
}