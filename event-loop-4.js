const fs=require('fs');
setImmediate(() => {
    console.log("setImmediate");
})  

setTimeout(() => {
    console.log("Timer expired")
}, 0);

Promise.resolve("Promise").then(console.log)

fs.readFile("./file.txt", "utf-8", (err, data) => {
   console.log("File reading cb")
})
process.nextTick(() => {
    process.nextTick(()=>{
        console.log("inner nextTick");
    })
    console.log("nextTick");
})

console.log("This is last line of code");