const express = require('express');
const router = require('./router.js');
require('dotenv').config({path: '.env'});

const app = express();
app.use(express.json());

app.get("/test", (req, res) =>{
    console.log(`GET request on /test from ${req.ip}`)
    res.status(200).json({message: 'hello test!'});
});

//router for authenticated user requests
//auth middleware yet to be added
app.use("/api", router);

app.listen(process.env.PORT, (error) =>{
    if(!error)
        console.log(`Server available on http://localhost:${process.env.PORT}`)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

module.exports = app;