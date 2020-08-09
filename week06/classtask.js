/**
 * 编写一个 match 函数。
 * 它接受两个参数，第一个参数是一个选择器字符串性质，第二个是一个 HTML 元素。
 * 这个元素你可以认为它一定会在一棵 DOM 树里面。
 * 通过选择器和 DOM 元素来判断，当前的元素是否能够匹配到我们的选择器。
 * （不能使用任何内置的浏览器的函数，仅通过 DOM 的 parent 和 children 这些 API，
 * 来判断一个元素是否能够跟一个选择器相匹配。）
 */


function match(selector, element) {
    var selectorParts = selector.split(" ").reverse();

    var elements = $(element).parents();//从当前元素逐级往外匹配
    
    if(!matchElement(element, selectorParts[0])) {//是否匹配当前元素
        return false;
    }

    let matched = false;
    
    var j = 1;//当前选择器的位置
    for(var i = 0; i < elements.length; i++) {//i-当前元素的位置
        if(matchElement(elements[i], selectorParts[j])) {
            j++;
        }
    }
    if (j >= selectorParts.length) {
        matched = true;
    }

    return matched;
}


//selector都是简单选择器,三种：
//.a  #id  div
function matchElement(element, selector) {

    if(!selector || !element.attributes) {//选择器不存在
        return false;
    }
    if(selector.charAt(0) == "#") {
        var attr = $(element).attr('id');
        if(attr && attr.match(selector.replace("#", ""))) {
            return true;
        }
    } else if(selector.charAt(0) == ".") {
        var attr = $(element).attr('class');
        if(attr && attr.match(selector.replace(".", ""))) {
            return true;
        }
    } else {
        if(element.tagName.toLowerCase() === selector) {
            return true;
        }
    }
    return false;
}


match("div #id .img", document.getElementsByClassName("img")[0]);