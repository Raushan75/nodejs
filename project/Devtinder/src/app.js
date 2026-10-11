const express= require('express');

const app= express();


app.get("/getUserData", (req, res) => {
    throw new Error("error from user data");
  res.send("user data saved");
});

app.use("/",(err,req,res,next)=>{
    if(err){
        res.status(500).send("internal server error");
    }
})


app.listen(3000,()=>{
    console.log('server is running on port 3000');
})