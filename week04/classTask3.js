
//find abcdef
function find(str) {
	var index = 0;
	var needToFind = "abcdef";
	for(let ch of str) {
		if (index < needToFind.length) {
			if (ch == needToFind[index]) {
				index++; 
			} else if(ch == needToFind[0]){//匹配a
				index = 1;
			} else {
				index = 0;
			}
		} else {
			console.info("find "+needToFind+" in '"+str+"'")
			return true;
		}
	}
	if(index == needToFind.length) {
		console.info("find "+needToFind+" in '"+str+"'")
			return true;
	}
	console.info("no "+needToFind+" in '"+str+"'")
	return false;
}

find("1abcdef fd");
find("abrcdef");
find("ababcdef");


//状态机版本
function match(string) {
	let state = start;
	for(let c of string) {
		state = state(c);
	}
	return state === end;
}

function start(c) {
	if (c === "a") 
		return foundA;
	else
		return start;
}

function end(c) {
	return end;
}

function foundA(c) {
	if (c === "b") 
		return foundB;
	else
		return start(c);//reComsume
}

function foundB(c) {
	if (c === "c") 
		return foundC;
	else
		return start(c);//reComsume
}
function foundC(c) {
	if (c === "d") 
		return foundD;
	else
		return start(c);//reComsume
}
function foundD(c) {
	if (c === "e") 
		return foundE;
	else
		return start(c);//reComsume
}
function foundE(c) {
	if (c === "f") 
		return end(c);
	else
		return start(c);//reComsume
}

console.info(match("ababdef"));
console.info(match("ababcdef"));