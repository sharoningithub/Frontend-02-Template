//四则运算

<Number>::="0" | "1" | "2"....|"9"

<MuiltiplicativeExpression>::= 
	<Number>
	|<MuiltiplicativeExpression> * <Number>
	|<MuiltiplicativeExpression> / <Number>

<AddtiveExpression>::=<MuiltiplicativeExpression>
	|<AddtiveExpression + <MuiltiplicativeExpression>
	|<AddtiveExpression - <MuiltiplicativeExpression>


// 带括号的四则运算
<Number>::="0" | "1" | "2"....|"9"
<AtomExpression>::=(<AddtiveExpression>) 
	| <Number>
<MuiltiplicativeExpression>::=<AtomExpression>*<MuiltiplicativeExpression>
	| <AtomExpression>/<MuiltiplicativeExpression>
	| <AtomExpression>
<AddtiveExpression>::=<MuiltiplicativeExpression>+<AtomExpression>
	| <MuiltiplicativeExpression>-<AtomExpression>
	| <MuiltiplicativeExpression>


//更简便的方法
<MuiltiplicativeExpression>::= 
	<Number>
	|<MuiltiplicativeExpression> * <Number>
	|<MuiltiplicativeExpression> / <Number>

<AddtiveExpression>::=<MuiltiplicativeExpression>
	|<AddtiveExpression + <MuiltiplicativeExpression>
	|<AddtiveExpression - <MuiltiplicativeExpression>
	|(<AddtiveExpression)