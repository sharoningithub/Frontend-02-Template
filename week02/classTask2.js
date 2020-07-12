
/**
 * 思路
 * string -> char
 * char -> unicode码
 * unicode码 -> utf8编码方式产生的字节
 * 字节 -> buffer
 */ 

function UTF8_Encoding(str) {
	var bytes =[];
	//string -> char; char -> unicode码
	
	for (ch of str) {
	    console.info("char:" + ch);
	    /*用codePointAt而不是charCodeAt:
		  JavaScript 内部，字符以 UTF-16 的格式储存，每个字符固定为2个字节。
		  对于那些需要4个字节储存的字符（Unicode 码点大于0xFFFF的字符），
		  JavaScript 会认为它们是两个字符
		  ES6 提供了codePointAt()方法，能够正确处理 4 个字节储存的字符*/
	    var code = ch.codePointAt(0);
	    console.info("code:"+code+"-0x"+code.toString(16));

	    var byte = Unicode2Utf8Byte(code);
	    const buf = Buffer.from(byte);
	    console.info("利用buffer从byte转为char：" +buf.toString()+ "\n");

	    bytes = bytes.concat(byte);
	}
	console.info("bytes:"+bytes)
	const bufs = Buffer.from(bytes);
	console.info("利用buffer从byte转为string：" +bufs.toString()+ "\n");
	return bufs;
}

/* unicode码 -> utf8编码方式产生的字节
 *	1个字节-0xxxxxxx,有7个有效位，最大值0x7f
 *	2个字节-110xxxxx 10xxxxxx,有11个有效位，最大值0x7ff
 *	3个字节-1110xxxx [10xxxxxx]{2},有16个有效位，最大值0xffff
 *	4个字节-11110xxx [10xxxxxx]{3},有21个有效位，最大值0x1fffff
 * @param unicode
 */
function Unicode2Utf8Byte (unicode) {
	var code = unicode;
	var byte = [];
	if (code <= 0x7f) {
		console.info("code <= 0x7f");
    	byte[0] = code;
    } else if (code <= 0x7ff) {
    	console.info("code <= 0x7ff");
    	byte[1] = code & 0x3f | 0x80;
	    byte[0] = code >> 6 | 0xc0;

    } else if (code <= 0xffff) {
    	console.info("code <= 0xffff");
    	byte[2] = code & 0x3f | 0x80;
    	byte[1] = code >> 6 & 0x3f | 0x80;
    	byte[0] = code >> 12 | 0xe0;

    } else if (code <= 0x1fffff) {
    	console.info("code <= 0x1fffff");
    	byte[3] = code & 0x3f | 0x80;
    	byte[2] = code >> 6 & 0x3f | 0x80;
    	byte[1] = code >> 12 & 0x3f | 0x80;
    	byte[0] = code >> 18 | 0xf0;

    } else {
    	console.error("out of Range");
    }

    var byteView = "utf8编码的byte:";
    for (var i = 0; i < byte.length; i++) {
    	byteView += " 0x" + byte[i].toString(16);
    }
    console.info(byteView);

    return byte;

}

UTF8_Encoding("123chinaAB_ǿ中国☯䷷가𓀍");
