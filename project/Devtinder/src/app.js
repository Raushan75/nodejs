const express= require('express');

const app= express();

// app.use("/route",rH,[rH2,rH3],[rH4]);

app.use(
  "/user",
  (req, res, next) => {
    res.send("this is first handle");
    next();
  },
  (req, res) => {
    res.send("this is second handle");
  },
  (req, res) => {
    res.send("this is third handle");
  },
  (req, res) => {
    res.send("this is fourth handle");
  },
);
app.listen(3000,()=>{
    console.log('server is running on port 3000');
})