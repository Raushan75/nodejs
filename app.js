require('./xyz'); //one module into another
// import {calculateSum} from './sum.js'; //importing module using ES6 syntax
// const obj =require('./sum'); 
// const {x, calculateSum} = require('./calculate/sum'); //destructuring assignment
// const {calculateMultiple} = require('./calculate/multiple'); //destructuring assignment
const {calculateMultiple, calculateSum} = require('./calculate'); //destructuring assignment

const data = require('./data.json'); //importing json file

console.log(JSON.stringify(data)); //converting json object to string
console.log(data);

var name="Raushan"
var a = 30;
var b = 20;
calculateSum(a,b); // calling function from sum.js
calculateMultiple(a,b); // calling function from multiple.js
// console.log(name);
// console.log(a+b);
// console.log(global);
// console.log(this); // empty object
