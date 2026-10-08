const fs=require('fs');
const a=100;
setImmediate(() => {
    console.log("This is setImmediate");
})
fs.readFile("./file.txt", "utf-8", (err, data) => {
    console.log("This is async.js file" );
})

setTimeout(() => {
    console.log("This is async.js file after 2 seconds");
}, 0);

function printA(){
    console.log("a =" , a);
}

printA();

console.log("This is last line of code");