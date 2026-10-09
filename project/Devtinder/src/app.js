const express= require('express');

const app= express();

// app.use("/", (req, res) => {
//   res.send("welcome to Raushan");
// });


// app.use("/hello", (req, res) => {
//   res.send("hello hello hello");
// });

app.use("/user", (req, res) => {
        res.send("welcome to Raushan");
    });

//this will  only handle get call to /user
app.get("/user" , (req, res)=>{
    res.send({firstName:"Raushan" , lastName:"Kumar"});
})

app.post("/user" , (req, res)=>{
    //saving the data
    console.log("Save data to  the database");
    res.send("data successfully save to the database");
})

app.delete("/user" , (req, res)=>{
    //deleting the data
    res.send("data successfully deleted");
})

//this will match all the http method  Api  call to /test
app.use("/test",(req,res) =>{
    res.send('hello world');
});

app.listen(3000,()=>{
    console.log('server is running on port 3000');
})