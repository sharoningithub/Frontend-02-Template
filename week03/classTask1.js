/*
 *StringToNumber、NumberToString
 *通过传一个进制来确定要转成什么进制的Number
 *感觉跟js的toString(hex)方法很像
 *关键是进制转换
 */

var Stack = (function(){
    var items = new WeakMap();
    //先入后出，后入先出
    class Stack{
        constructor(){
            items.set(this,[]);
        }
        push(ele){
            //入栈
            var ls = items.get(this);
            ls.push(ele);
        }
        pop(){
            //出栈
            var ls = items.get(this);
            return ls.pop();
        }
        size(){
            //获取栈的长度
            var ls = items.get(this);
            return ls.length;
        }
        print(){
            //打印栈
            var ls = items.get(this);
            return ls.toString();
        }
    }
    return Stack;
})();

/**
 * 十进制转其他进制
 * num 需要转化的数字
 * base 转化的进制，默认为 2
 * */
function DecimalToOther(num,base){
    base = Math.floor(base) || 2;
    if(typeof num != "number" || num < 0 || base > 16 || base < 2){
        throw new Error("参数错误");
        return '';
    }
    num = Math.floor(num);
 
    var code = "0123456789ABCDEF";
    var stack = new Stack();
    var res = '';
    var rem;
    while(num > 0){
        rem = num % base;
        stack.push(rem);
        num = Math.floor(num/base);
    }
     
    while(stack.size() > 0){
        res += code[stack.pop()];
    }
     
    return res;
}

/**
 * 任意进制转十进制
 * num 需要转化的数字
 * base 待转化数字的进制
 * */
function OtherToDecimal(num,base){
    var bases = [0,1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F"];
    var config = {};
    for(var k = 0; k < base; k++){
        config[bases[k]] = k;
    }
    num = String(num);
    num = num.toUpperCase();
    var count =  0;
    var res = 0;
    var i;
    while(num.length > 0){
        i  = num[num.length - 1];
        i = config[i];
        res = res + i * Math.pow(base,count);
        num = num.substr(0,num.length-1);
        count++;
    }
    return res;
}

//思路
//1、str判断进制
//2、其他进制转十进制
//2、十进制数转其他
function StringToNumber(str, hex) {
	var prefix = str.substr(0, 2).toUpperCase();
	var decimalNumber = Number(str);//十进制
	var strHex = 10;
	if(prefix == "0B") {//二进制
		strHex = 2;
	} else if(prefix == "0O") {//八进制
		strHex = 8;
	} else if(prefix == "0X") {//十六进制
		strHex = 16;
	}
	console.info("str："+str+"-"+strHex+"进制");
	if (strHex != 10) {
		decimalNumber = OtherToDecimal(str.substr(2), strHex);
	}
	var result = DecimalToOther(decimalNumber,hex);
	console.info("转化为："+result+"-"+hex+"进制");
	return Number(result);
}

//思路
//1、Number转十进制
//2、十进制转其他进制
function NumberToString(num, hex) {
	console.info("num："+num);
	var decimal = Number(num);
	var result = decimal;
	if (hex != 10) {
		result = DecimalToOther(decimal,hex);
	}
	console.info("转化为："+result+"-"+hex+"进制");
	return String(result);
}

StringToNumber("37", 8);
NumberToString(0X1F, 2)
