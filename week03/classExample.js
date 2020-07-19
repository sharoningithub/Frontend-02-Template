var a = 2;
void function (){
	console.log("执行function")
	a = 1;
	return;
	var a;
}();
console.log(a);

var a = 2;
void function (){
	console.log("执行function")
	a = 1;
	return;
	const a;
}();
console.log(a);