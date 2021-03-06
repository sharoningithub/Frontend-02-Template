


function layout(element) {
    if(!element.computedStyle) {
        return;
    }
    var elementStyle = getStyle(element);

    if(elementStyle.display != "flex") {
        return;
    }

    var items = element.children.filter(e => e.type === "element");//过滤掉文本结点

    items.sort(function(a, b) {
        return (a.order || 0) - (b.order || 0);
    });

    var style = elementStyle;

    //主轴和交叉轴处理
    ['width', 'height'].forEach(size => {
        if(style[size] === 'auto' || style[size] === '') {
            style[size] = null;
        }
    })

    if(!style.flexDirection || style.flexDirection === 'auto') {
        style.flexDirection = 'row';
    }
    if(!style.alignItems || style.alignItems === 'auto') {
        style.alignItems = 'stretch';
    }
    if(!style.justifyContent || style.justifyContent === 'auto') {
        style.justifyContent = 'flex-start';
    }
    if(!style.flexWrap || style.flexWrap === 'auto') {
        style.flexWrap = 'nowrap';
    }
    if(!style.alignContent || style.alignContent === 'auto') {
        style.alignContent = 'stretch';
    }

    var mainSize, mainStart, mainEnd, mainSign, mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase;
    if(style.flexDirection === 'row') {
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    } 
    if(style.flexDirection === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if(style.flexDirection === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    if(style.flexDirection === 'column-reverse') {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    if(style.flexWrap === 'wrap-reverse') {
        var tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossStart = -1;
    } else {
        crossBase = 0;
        crossSign = 1;
    }

    var isAutoMainSize = false;
    if(!style[mainSize]) {// atuo sizing
        elementStyle[mainSize] = 0;
        for(var i = 0; i < items.length; i++) {
            var item = items[i];
            if(itemStyle[mainSize] != null || itemStyle[mainSize] > 0) {
                elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
            }
        }
        isAutoMainSize = true;
    }

    var flexLine = [];
    var flexLines = [flexLine];

    var mainSpace = elementStyle[mainSize];//主轴剩余空间
    var crossSpace = 0;//交叉轴空间

    for(var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemStyle = getStyle(item);

        if(itemStyle[mainStyle] === null) {
            itemStyle[mainStyle] = 0;
        }

        if(itemStyle.flex) {
            flexLine.push(item);
        } else if(style.flexWrap === 'mowrap' && isAutoMainSize) {
            mainSpace -= itemStyle[mainSize];
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            flexLine.push(item);
        } else {
            if(itemStyle[mainSize] > style[mainSize]) {//尺寸超过父元素则压缩
                itemStyle[mainSize] = style[mainSize];
            }
            if(mainSpace < itemStyle[mainSize]) {
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;
                flexLine = [item];//创建新行
                flexLines.push(flexLine);//添加新行
                //重置
                mainSpace = style[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item);
            }
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            mainSpace -= itemStyle[mainSize];
        }
        flexLine.mainspace = mainspace;
        
        //计算主轴

        if(style.flexWrap === 'nowrap' || isAutoMainSize) {
            flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize]:crossSpace;
        } else {
            flexLine.crossSpace = crossSpace;
        }

        if(mainspace < 0) {
            //对所有的元素进行等比压缩
            var scale = style[mainSize] / (style[mainSize] - mainspace);
            var currentMain = mianBase;
            for(var i = 0; i < items.length; i++) {
                var item = items[i];
                var itemStyle = getStyle(item);

                if(itemStyle.flex) {
                    itemStyle[mainSize] = 0;
                }

                itemStyle[mainSize] = itemStyle[mainSize] * scale;
                itemStyle[mainSize] = itemStyle[mainStart] + mainSign + itemStyle[mainSize];
                currentMain = itemStyle[mainEnd];
            }

        } else {
            flexLines.forEach(function(items){
                var mainspace = items.mainspace;
                var flexTotal = 0;
                for(var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var itemStyle = getStyle(item);

                    if((itemStyle.flex !== null) && (itemStyle.flex !==(void 0))) {
                        flexTotal += itemStyle.flex;
                        continue;
                    }
                }

                if(flexTotal > 0) {//有flex元素
                    var currentMain = mainBase;
                    for(var i = 0; i<items.length;i++) {
                        var item = items[i];
                        var itemStyle = getStyle(item);

                        if(itemStyle.flex) {
                            itemStyle[miansize] = (mainspace /flexTotal) * itemStyle.flex;
                        }
                        itemStyle[mainStart] = currentMain;
                        itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                        currentMain = itemStyle[mainEnd];
                    }
                } else {//没有flex元素,剩余空间根据justifyContent来分配
                    if(style.justifyContent === 'flex-start') {
                        var currentMain = mainBase;
                        var step = 0;//元素之间的间隔的个数
                    }
                    if(style.justifyContent === 'flex-end') {
                        var currentMain = mainspace * mainSign + mainBase;
                        var step = 0;
                    }
                    if(style.justifyContent === 'center') {
                        var currentMain = mainspace / 2 * mainSign + mainBase;
                        var step = 0;
                    }
                    if(style.justifyContent === 'space-between') {
                        var step = mainspace / (items.length - 1) * mainSign;
                        var currentMain = mainspace;
                    }
                    if(style.justifyContent === 'space-around') {
                        var step = mainspace / items.length * mainSign;
                        var currentMain = step / 2 + mainBase;
                    }
                    for(var i = 0; i < items.length; i++) {
                        var item = items[i];
                        itemStyle[mainStart, currentMain];
                        itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[miansize];
                        currentMain = itemStyle[mainEnd] + step;
                    }
                }
            })

        }


        //计算交叉轴
        var crossSpace;
        if(!style[crossSize]) {//auto sizing
            crossSpace = 0;
            elementStyle[crossSize] = 0;
            for(var i = 0; i<flexLines.length; i++) {
                elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace;
            }
        } else {
            crossSpace = style[crossSize];
            for(var i = 0; i<flexLines.length; i++) {
                crossSpace -= flexLines[i].crossSpace;
            }
        }

        if(style.flexWrap === 'wrap-reverse') {
            crossBase = style[crossSize];
        } else {
            crossBase = 0;
        }
        var lineSize = style[crossSize] / flexLines.length;

        var step;
        if(style.alignContent === 'flex-start') {
            crossBase += 0;
            step = 0;
        }
        if(style.alignContent === 'flex-end') {
            crossBase += crossSign * crossSpace;
            step = 0;
        }
        if(style.alignContent === 'center') {
            crossBase += crossSign * crossSpace / 2;
            step = 0;
        }
        if(style.alignContent === 'space-between') {
            
            crossBase += 0;
            step = crossSpace / (flexLines.length - 1);
        }
        if(style.alignContent === 'space-around') {
            step = crossSpace / (flexLines.length);
            crossBase += crossSign * step / 2;
        }
        if(style.alignContent === 'stretch') {
            crossBase += 0;
            step = 0;
        }

        flexLines.forEach(function(items) {
            var lineCrossSize = style.alignContent === 'stretch' ?
                items.crossSpace + crossSpace / flexLines.length:
                items.crossSpace;
            
            for(var i = 0; i < items.length; i++) {
                var item = items[i];
                var itemStyle = getStyle(item);

                var align = itemStyle.alignSelf || style.alignItems;

                if(item === null) {
                    itemStyle[crossSize] = (align === 'stretch') ?
                    lineCrossSize : 0;
                }
                if(align === 'flex-start') {
                   itemStyle[crossStart] = crossBase;
                   itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]; 
                }

                if(align === 'flex-end') {
                    itemStyle[crossStart] = crossBase + crossSign * lineCrossSize;
                    itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
                }

                if(align === 'center') {
                    itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
                    itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
                }
                if(align === 'stretch') {
                    itemStyle[crossStart] = crossBase;
                    itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] != null) && itemStyle[crossSize] !== (void 0));
                    itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
                 }
            }
            crossBase += crossSign * (lineCrossSize + step);
        });

    }
}

module.exports = layout;