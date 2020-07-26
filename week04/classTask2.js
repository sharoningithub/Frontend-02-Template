
function findAB(str) {
	for (var i = 0; i < str.length - 1; i++) {
		if (str[i] == "a" && str[i+1] == "b") {
			console.info("find ab in "+str)
			return true;
		}
	}
	console.info("no ab in "+str)
	return false;
}

findAB("abcdeda");
findAB("acbacdeda");