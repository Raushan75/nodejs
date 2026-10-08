const fs=require('fs');
const crypto=require('crypto');
process.env.UV_THREADPOOL_SIZE=2;
crypto.pbkdf2("password", "salt", 500000, 50, "sha512", (err, Key) => {
    console.log("first key generated");
})

// fs.readFile("./file.txt", "utf-8", (err, data) => {
//     console.log("This is async.js file" );
// })

crypto.pbkdf2("password", "salt", 500000, 50, "sha512", (err, Key) => {
    console.log("second key generated");
})