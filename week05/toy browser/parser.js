const css = require('css');
const EOF = Symbol("EOF");//end of file
const layout = require("/layout.js")

let currentToken = null;//标签
let currentAttribute = null;//属性
let stack = [{type: "document", children:[]}];
let currentTextNode = null;

let rules = []; //css规则

//解析css规则，默认在所有element之前
function addCSSRules(text) {
    var ast = css.parse(text);
    console.log(JSON.stringify(ast, null, "   "));
    rules.push(...ast.stylesheet.rules)

}

//selector都是简单选择器,三种：
//.a  #id  div
function match(element, selector) {
    if(!selector || !element.attributes) {//选择器不存在 || 元素是文本节点
        return false;
    }
    if(selector.charAt(0) == "#") {
        var attr = element.attributes.filter(attr => attr.name === "id")[0];
        if(attr && attr.value === selector.replace("#", "")) {
            return true;
        }
    } else if(selector.charAt(0) == ".") {
        var attr = element.attributes.filter(attr => attr.name === "class")[0];
        if(attr && attr.value === selector.replace(".", "")) {
            return true;
        }
    } else {
        if(element.tagName === selector) {
            return true;
        }
    }
    return false;
}

function specificity(selector) {
    var p = [0,0,0,0];
    var selectorParts = selector.split(" ");
    for(var part of selectorParts) {
        if(part.charAt(0) == "#") {
            p[1] += 1;
        } else if(part.charAt(0) == ".") {
            p[2] += 1;
        } else {
            p[3] += 1;
        }
    }
    return p;
}

function compare(sp1, sp2) {
    if(sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0];
    }
    if(sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1];
    }
    if(sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2];
    }
    return sp1[3] - sp2[3];
}

function computeCSS(element) {
    var elements = stack.slice().reverse();//从当前元素逐级往外匹配
    if(!element.computedStyle) {
        element.computedStyle = {};
    }

    for(let rule of rules) { 
        var selectorParts = rule.selectors[0].split(" ").reverse();

        if(!match(element, selectorParts[0])) {//是否匹配当前元素
            continue;
        }

        let matched = false;
        
        var j = 1;//当前选择器的位置
        for(var i = 0; i < elements.length; i++) {//i-当前元素的位置
            if(match(elements[i], selectorParts[j])) {
                j++;
            }
        }
        if (j >= selectorParts.length) {
            matched = true;
        }

        //匹配到了,将style内容加到元素上
        if(matched) {
            var sp = specificity(rule.selectors[0]);
            var computedStyle = element.computedStyle;
            for(var declaration of rule.declarations) {
                if(!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {};

                    if(!computedStyle[declaration.property].specificity) {
                        computedStyle[declaration.property].value = declaration.value;
                        computedStyle[declaration.property].specificity = sp;
                    } else if(compare(computedStyle[declaration.property].specificity, sp) < 0) {
                        computedStyle[declaration.property].value = declaration.value;
                        computedStyle[declaration.property].specificity = sp;
                    }
                    
                }
            }
        }


    }
}

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

        //css computing
        computeCSS(element);

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
            //遇到style标签时，执行添加css规则的操作
            if(top.tagName === "style") {
                addCSSRules(top.children[0].content);
            }
            //排版
            layout(top);
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