const fs=require('fs');
setImmediate(() => {
    console.log("setImmediate");
})  

setTimeout(() => {
    console.log("Timer expired")
}, 0);

Promise.resolve("Promise").then(console.log)

fs.readFile("./file.txt", "utf-8", (err, data) => {
   setTimeout(()=>{
    console.log("2nd timer expired");
   },0);

   process.nextTick(() => {
       console.log("2nd nextTick");
   })

   setImmediate(() => {
       console.log("2nd setImmediate");
   })

   console.log("File reading cb")
})
process.nextTick(() => {
    console.log("This is process.nextTick");
})

console.log("This is last line of code");