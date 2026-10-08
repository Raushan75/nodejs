console.log("This is sync.js file");
var a = 1078698;
var b = 2986;
//this callback will only be pushed to call stack in v8 once the call stack is empty
setTimeout(() => {
    console.log("call right now");
}, 0); //trust issues with settimeout

setTimeout(() => {
    console.log("This is async.js file after 2 seconds");
},3000)
function multiplyFn(x, y) {
  const result = x * y;
  return result;
}
var c = multiplyFn(a, b);
console.log("The product is:", c);
