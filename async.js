const fs = require('fs');
const https = require('https');

var a = 1078698;
var b = 2986;

https.get('https://dummyjson.com/products/1', (res) => {
    console.log("This is async.js file");
});

setTimeout(() => {
    console.log("This is async.js file after 2 seconds");
}, 2000);
fs.readFile("./file.txt", "utf-8", (err, data) => {
    console.log("This is async.js file" , data);
});
function multiplyFn(x, y) {
  const result = x * y;
  return result;
}
var c = multiplyFn(a, b);
console.log("The product is:", c);
