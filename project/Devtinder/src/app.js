const express= require('express');

const app= express();

const { adminAuth, userAuth } = require("./middleware/auth");


//Get /user => it check all the  app.xxx("matching route") fuctions
//Get /user => midlleware chain => request handler
// app.use("/",(req,res,next)=>{
//     // res.send("handling / route");
//     next();
// })
// app.get(
//   "/user",
//   (req, res, next) => {
//     res.send("this is first handle");
//     next();
//   },
//   (req, res) => {
//     res.send("this is second handle");
//   },
//   (req, res) => {
//     res.send("this is third handle");
//   },
//   (req, res) => {
//     res.send("this is fourth handle");
//   },
// );

// Handle auth middleware for all the routes of /admin 
app.use("/admin",adminAuth);
app.use("/user",userAuth)

app.get("/user",userAuth, (req, res) => {
  res.send("User data Sent");
}); 

app.post("/user/login", (req, res) => {
  res.send("user logged in");
});

app.get("/admin/getAllData",(req,res)=>{
     res.send("all data fetched");
})

app.get("/admin/deleteUser", (req, res) => {
 res.send("user deleted");
});

app.listen(3000,()=>{
    console.log('server is running on port 3000');
})