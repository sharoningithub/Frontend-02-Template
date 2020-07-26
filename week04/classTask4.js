
//find abcabx
function match(string) {
	var flag;//是否已经找到abc
	let state = start;
	
	for(let c of string) {
		state = state(c);
	}
	return state === end;
}

function start(c) {
	flag = 0;
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
	if (c === "c") {
		if (flag == 0) {
			flag = 1;
		} 
		return foundC;
	}
	if (c === "x") {
		if (flag == 1) {
			return end;
		}
	}
	return start(c);//reComsume
}

function foundC(c) {
	if (c === "a") 
		return foundA;
	else
		return start(c);//reComsume
}

console.info(match("abcAabx"));
console.info(match("abcabcabx"));


//上面的不对，状态机受到一个全局变量flag的影响，不是纯函数了

//find abcabx
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
	if (c === "a") 
		return foundA2;
	else
		return start(c);//reComsume
}

function foundA2(c) {
	if (c === "b") 
		return foundB2;
	else
		return start(c);//reComsume
}

function foundB2(c) {
	if (c === "x") 
		return end;
	else
		return foundB(c);//reComsume
}

console.info(match("abcAabx"));
console.info(match("abcabcabx"));

