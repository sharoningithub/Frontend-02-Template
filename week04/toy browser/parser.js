let currentToken = null;//标签
let currentAttribute = null;//属性
let stack = [{type: "document", children:[]}];
let currentTextNode = null;

//用栈构建dom树
function emit(token) {
    let top = stack[stack.length - 1];//栈顶元素
    if (token.type == "startTag") {//startTag 入栈
        let element = {
            type: "element",
            children: [],
            attribute: [],
        };
        element.tagName = token.tagName;

        for(let p in token) {
            if(p != "type" && p != "tagName") {
                element.attribute.push({
                    name:p,
                    value:toke[p]
                });
            }
        }
        //对偶操作,建立父子关系->树
        top.children.push(element);
        element.parent = top;
        
        if(!token.isSelfClosing){
            stack.push(element);
        }

        currentTextNode = null;
    } else if (token.type == "endTag") {
        if(top.tagName != token.tagName) {
            throw new Error("Tag start end doesn't match!");
        } else {//match success
            stack.pop();
        }
        currentTextNode = null;
    } else if(token.type === "text") {
        if(currentTextNode == null) {
            currentTextNode = {
                type: "text",
                content: ""
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
    
}

const EOF =Symbol("EOF");//end of file

//start state
function data(c) {
    if(c == "<") {
        return tagOpen;
    } else if(c === EOF) {
        emit({
            type:"EOF"
        })
        return;
    } else {
        emit({
            type:"text",
            content:c
        })
        return data;
    }
}

function tagOpen(c) {
    if(c == "/") {
        return endTagOpen;
    } else if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {//初始化startTag
            type:"startTag",
            tagName: ""
        }
        return tagName(c);//reConsume
    } else {
        return;
    }
}

function endTagOpen(C) {
    if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {//初始化endTag
            type:"endTag",
            tagName: ""
        }
        return tagName(c);
    } else if(c == ">") {
        //exception
    } else if(c == EOF){
        //exception
    } else {
        //exception
    }
}

//自封闭标签
function selfClosingStartTag(c) {
    if(c == ">") {
        currentToken.isSelfClosing = true;
        return data;
    } else if(c == EOF){

    } else {

    }
}

function tagName(c) {
    if(c.match(/^[\t\n\f ]$/)) {//html中有效的空白符：tab符、换行符、换页符、空格
        return beforeAttributeName;
    } else if(c =="/") {
        return selfClosingStartTag;
    } else if(c.match(/^[a-zA-Z]$/)){
        currentToken.tagName += c;
        return tagName;
    } else if (c == ">") {
        emit(currentToken);
        return data;
    } else {
        return tagName;
    }
}

//属性
function beforeAttributeName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c == "/" || c == ">" || c == EOF) {
        return attributeName(c);
    } else if(c == "=") {
        //exception
    } else {
        currentAttribute = {//初始化属性
            name:"",
            value:""
        }
        return attributeName(c);
    }
}


function attributeName(c) {
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF){
        return afterAttributeName(c);
    } else if(c == "=") {
        return beforeAttributeValue;
    } else if(c =="\u0000") {
        
    } else if(c == "\"" || c == "'" || c == "<") {

    } else {
        currentAttribute.name +=c;
        return attributeName;
    }
}

function afterAttributeName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName;
    } else if (c == "/") {
        return selfClosingStartTag;
    } else if(c == "=") {
        return beforeAttributeValue;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if(c == EOF){

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {//初始化属性
            name:"",
            value:""
        }
        return attributeName(c);
    }
}

function beforeAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return beforeAttributeValue;
    } else if(c == "\"") {
        return doubleQuotedAttributeValue;
    } else if(c == "\'") {
        return singleQuotedAttributeValue;
    } else if(c == ">") {

    } else {
        return UnquoteAttributeValue
    }
}

function doubleQuotedAttributeValue(c) {
    if(c == "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuoteAttributeValue;
    } else if(c =="\u0000") {
        
    } else if(c == "EOF"){

    } else {
        currentAttribute.value +=c;
        return doubleQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue(c) {
    if(c == "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuoteAttributeValue;
    } else if(c =="\u0000") {
        
    } else if(c == "EOF"){

    } else {
        currentAttribute.value +=c;
        return doubleQuotedAttributeValue;
    }
}

function afterQuoteAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    } else if(c == "/") {
        return selfClosingStartTag;
    } else if(c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if(c == "EOF"){

    } else {
        currentAttribute.value +=c;
        return doubleQuotedAttributeValue;
    }
}

function UnquoteAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/)){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if(c == "/") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    } else if(c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
    } else if(c =="\u0000") {

    } else if(c == "\"" || c == "'" || c == "<" || c == "=" || c == "`"){

    } else if(c == "EOF"){

    } else {
        currentAttribute.value +=c;
        return UnquoteAttributeValue;
    }
}


module.exports.parserHTML = function parserHTML(html) {
    let state = data;
    for(let c of html) {
        state = state(c);
    }
    state = state(EOF);
    console.log(stack[0])
}