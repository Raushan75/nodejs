const express= require('express');

const app= express();

//this will  only handle get call to /user
app.get("/user/:userId/:name/:password" , (req, res)=>{
    console.log(req.params);
    res.send({firstName:"Raushan" , lastName:"Kumar"});
})


app.listen(3000,()=>{
    console.log('server is running on port 3000');
})