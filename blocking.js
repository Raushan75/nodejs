const crypto = require("crypto");
console.log("This is sync.js file");
var a = 1078698;
var b = 2986;

//pbkdf2 : password based key derivation function

//Synchronous function - will block the main  thread - don't use it
crypto.pbkdf2Sync("password", "salt", 100000, 64, "sha512");
console.log("first key generated");

setTimeout(() => {
    console.log("call me right now");
}, 0); // it will only be called once call stack of main thread is empty

// Asynchronous function
crypto.pbkdf2("password", "salt", 100000, 64, "sha512", (err, derivedKey) => {
    console.log("second key generated");
});

function multiplyFn(x, y) {
  const result = x * y;
  return result;
}
var c = multiplyFn(a, b);
console.log("The product is:", c);
