//用JavaScript设计狗咬人这样一段代码

/**
 * 思路
 * 对象：Animal-Human、Dog
 * 对象的状态：name、health、biteDamage、sound
 * 对象的行为：bite
 */

class Animal {
	constructor(name, health, biteDamage, sound) {
		this.name = name || 'animal';
	    this.health = health || 100;
	    this.biteDamage = biteDamage || 50;
	    this.sound = sound || "--"
	}
	// {float} strength= [0,1]
	bite(animal,strength) {
		animal.health -= this.biteDamage*strength;
		console.log(this.name + ' 咬 ' + animal.name);
		animal.shout();
	}

	shout() {
		console.log(this.name + ":" + this.sound);
	}

	showHealth() {
		console.log(this.name + "-health:" + this.health);
	}
}

class Human extends Animal {
	constructor(name, health, biteDamage, sound) {
		super(name, health, biteDamage, sound); 
		this.name = name || 'human';
		this.health = health || 100;
		this.biteDamage = biteDamage || 10;
		this.sound = sound || '啊~~'；
	}
}

class Dog extends Animal {
	constructor(name, health, biteDamage, sound) {
		super(name, health, biteDamage, sound); 
		this.name = name || 'dog';
		this.health = health || 100;
		this.biteDamage = biteDamage || 50;
		this.sound = sound || '旺~~'；
	}
}

var human = new Human();
var dog = new Dog();

human.showHealth();

dog.bite(human, 0.5);

human.showHealth();


//以上思路有问题，行为bite这边，传了个对象进去，改变了别的对象的状态，
//就不符合“只设计改变对象内部状态的方法”的原则了。


/**
 *更改后的版本
 */
class Human {
	constructor(name, health) {
		this.name = name || 'human';
		this.health = health || 100;
	}
	hurt(damage) {
		this.health -= damage;
	}
	shout(content) {
		console.log(this.name + ":" + content);
	}
}

class Dog {
	constructor(name, biteDamage) {
		this.name = name || 'dog';
		this.biteDamage = biteDamage || 50;
	}
	// strength = [0,1]
	bite(strength) {
		return this.biteDamage*strength;
	}
}

var human = new Human("张三");
var dog = new Dog("大黄");

console.log(human.name + "'s health:" + human.health);

do {
	console.info(dog.name +"咬" +human.name)
	var strength = Math.round(Math.random()*10)/10;//0 0.1 0.2 …… 1
	console.info("strength:" + strength);
	human.hurt(dog.bite(strength));
	human.shout("啊~~");
	console.log(human.name + "'s health:" + human.health);
}
while (human.health > 0)

console.log(human.name + " 卒");
