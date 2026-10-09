const express= require('express');

const app= express();

app.use("/", (req, res) => {
  res.send("welcome to Raushan");
});


app.use("/hello", (req, res) => {
  res.send("hello hello hello");
});


app.use("/test",(req,res) =>{
    res.send('hello world');
});

app.listen(3000,()=>{
    console.log('server is running on port 3000');
})