const net = require("net")
const parser = require("/parser.js")

class Request {
    constructor(options) {
        this.method = options.method || "GET";
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || "/";
        this.body = options.body || {};
        this.headers = options.headers || {};
        if(!this.headers["Content-Type"]) {
            this.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }
        if(this.headers["Content-Type"] === "application/json") {
            this.bodyText = JSON.stringify(this.body);
        } else if(this.headers["Content-Type"] === "application/x-www-form-urlencoded"){
            this.bodyText = Object.keys(this.body)
                .map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
        }
        this.headers["Content-Length"] = this.bodyText.length;
    }

    //发请求
    send(connetion){
        return new Promise((resolve, reject) => {//返回一个response对昂
            //parser逐步的接受reponse的信息来构造response对象
            const parser = new ResponseParser;
            if(connetion) {
                connetion.write(this.toString());
            } else {
                connetion = net.createConnection({
                    host:this.host,
                    port:this.port
                }, ()=> {
                    connetion.write(this.toString());
                })
            }
            connetion.on('data',(data) => {
                console.log(data.toString());
                parser.receive(data.toString());
                if (parser.isFinished) {
                    resolve(parser.response);
                    connetion.end();
                }
            });
            connetion.on('error', (err)=>{
                reject(err);
                connetion.end();
            })
        });
    }

    toString(){
        return `${this.method} ${this.path} HTTP/1.1\r
        ${Object.keys(this.headers).map(key=>`${key}:${this.headers[key]}`),join('\r\n')}\r
        \r
        ${this.bodyText}`
    }
    
}

class ResponseParser {
    constructor(){
        //status line
        this.WATTING_STATUS_LINE = 0; //status line+\r
        this.WATTING_STATUS_LINE_END = 1; //\n
        //headers
        this.WATTING_HEADER_NAME = 2; //key+: or /r
        this.WATTING_HEADER_SPACE = 3; //空格
        this.WATTING_HEADER_VALUE = 4; //value+\r
        this.WATTING_HEADER_LINE_END = 5; //\n
        //空行
        this.WATTING_HEADER_BLOCK_END = 6; //\n
        //body
        this.WATTING_BODY = 7;//body

        //存储解析过程中产生的结果
        this.current = this.WATTING_STATUS_LINE;//置为初始状态
        this.statusLine = "";
        this.headers = {};
        this.headerName = "";
        this.headerValue = "";
        this.bodyParser = null;
    }

    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished;
    }

    get response(){
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
        return {
            statusCode:RegExp.$1,
            statusText:RegExp.$2,
            headers: this.headers,
            body:this.bodyParser.content.join('')
        }
    }
    
    receive(string) {
        for(let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i));
        }
    }
    //状态机
    receiveChar(char) {
        if(this.current == this.WATTING_STATUS_LINE) {
            if (char === '\r') {
                this.current = this.WATTING_STATUS_LINE_END;
            } else {
                this.statusLine += char;
            }
        } else if(this.current === this.WATTING_STATUS_LINE_END) {
            if(char === '\n') {
                this.current = this.WATTING_HEADER_NAME;
            }
        } else if(this.current ===this.WATTING_HEADER_NAME) {
            if(char === ':') {
                this.current = this.WATTING_HEADER_SPACE;
            } else if(char === '\r') {//说明下面要空行
                this.current = this.WATTING_HEADER_BLOCK_END;
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new TrunkedBodyParser();
                }
            } else {
                this.headerName += char;
            }
        } else if(this.current === this.WATTING_HEADER_SPACE) {
            if(char === ' ') {
                this.current = this.WATTING_HEADER_VALUE;
            }
        } else if (this.current === this.WATTING_HEADER_VALUE) {
            if (char === '\r') {
                this.current === this.WATTING_HEADER_LINE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = "";
                this.headerValue = "";
            } else {
                this.headerValue += char;
            }
        } else if(this.current === this.WATTING_HEADER_LINE_END) {
            if(char === '\n') {
                this.current = this.WATTING_HEADER_NAME;
            }
        } else if(this.current === this.WATTING_HEADER_BLOCK_END) {
            if(char === '\n') {
                this.current = this.WATTING_BODY;
            }
        } else if (this.current == this.WATTING_BODY) {
            this.bodyParser.receiveChar(char);
        }
    }
}

class TrunkedBodyParser{
    constructor(){
        this.WATTING_LENGTH = 0; //trunk length + \r
        this.WATTING_LENGTH_LINE_END = 1; //\n
        this.READING_TRUNK = 2; //trunk
        this.WATTING_NEW_LINE = 3; //new line + \r
        this.WATTING_NEW_LIEN_END = 4; //\n
        this.length = 0;
        this.content = [];
        this.isFinished = false;
        this.current = this.WATTING_LENGTH;
    }
    receiveChar(char) {
        if(this.current === this.WATTING_LENGTH) {
            if(char === '\r') {
                if(this.length === 0) {//一个length = 0的trunk
                    this.isFinished = true;
                }
                this.current = this.WATTING_LENGTH_LINE_END;
            } else {//计算得到trunk length
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        } else if(this.current === this.WATTING_LENGTH_LINE_END){
            if(char === '\n') {
                this.current = this.READING_TRUNK;
            }
        } else if(this.current === this.READING_TRUNK){
            this.content.push(char);
            this.length--;
            if(this.length === 0) {
                this.current = this.WATTING_NEW_LINE;
            }
        } else if(this.current === this.WATTING_NEW_LINE) {
            if(char === '\r') {
                this.current = this.WATTING_NEW_LIEN_END;
            }
        } else if(this.current === this.WATTING_NEW_LIEN_END) {
            if (char ==='\n') {
                this.current = this.WATTING_LENGTH;
            }
        }
    }
}

void async function(){
    let request = new Request({
        method: "POST",
        host:"127.0.0.1",
        port:"8088",
        path:"/",
        headers:{
            ["X-Foo2"]:"customed"
        },
        body:{
            name:"sharon"
        }
    });

    let response = await request.send();

    let dom = parser.parseHTML(response.body);

    console.log(dom);

}();