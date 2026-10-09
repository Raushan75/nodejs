
```Shell
// app.use("/", (req, res) => {
//   res.send("welcome to Raushan");
// });

// app.post("/user" , (req, res)=>{
//     //saving the data
//     console.log("Save data to  the database");
//     res.send("data successfully save to the database");
// })

// app.delete("/user" , (req, res)=>{
//     //deleting the data
//     res.send("data successfully deleted");
// })

//this will match all the http method  Api  call to /test
// app.use("/test",(req,res) =>{
//     res.send('hello world');
// });

// app.use("/hello", (req, res) => {
//   res.send("hello hello hello");
// });

// app.use("/user", (req, res) => {
//         res.send("welcome to Raushan");
//     });
```

```javascript
// app.use("/", (req, res) => {
//   res.send("welcome to Raushan");
// });

I changed line 6 of src/app.js to the Express 5 way of writing an optional part, which is curly braces:

app.get("/a{b}c", (req, res) => { ... })   // matches /abc and /ac

Nodemon should restart on its own once the file changes. I haven't run it myself.

If your tutorial uses Express 4, these other patterns will need changing too:

┌───────────────┬──────────────────────┬────────────────────────────────────────────────────────────────────────────┐
│   Express 4   │   What it matches    │                                 Express 5                                  │
├───────────────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ /ab?c         │ /abc, /ac            │ /a{b}c                                                                     │
├───────────────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ /ab+c         │ /abc, /abbc, /abbbc… │ regex: /ab+c/                                                              │
├───────────────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ /ab*cd        │ /abcd, /abXYZcd…     │ /ab*any/cd-style wildcards don't work the same, so use regex: /^\/ab.*cd$/ │
├───────────────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ /a(bc)?d      │ /ad, /abcd           │ /a{bc}d                                                                    │
├───────────────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ /user/:id?    │ /user, /user/5       │ /user{/:id}                                                                │
├───────────────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ * (catch-all) │ anything             │ /*splat or /{*splat}                                                       │
└───────────────┴──────────────────────┴────────────────────────────────────────────────────────────────────────────┘

Regular expressions still work in Express 5. Pass them without quotes, like app.get(/ab+c/, ...).

Another option is to install Express 4 with npm install express@4 so the old syntax keeps working. Learning the Express 5 syntax is the better choice, though, since 5 is the current version.

✻ Churned for 17s · done 11:43 PM
// app.use("/hello", (req, res) => {
//   res.send("hello hello hello");
// });

// app.use("/user", (req, res) => {
//         res.send("welcome to Raushan");
//     });
```
