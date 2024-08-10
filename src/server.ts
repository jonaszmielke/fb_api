require('dotenv').config({path: '.env'});
process.env['UV_THREADPOOL_SIZE'] = '32';

import express from 'express';
import unauth_router from './unauthenticated';
import auth_router from './authenticated';
import {authenticate} from './middleware';

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));




app.get("/test", (req, res) =>{
    console.log(`GET request on /test from ${req.ip}`)
    res.status(200).json({message: 'hello test!'});
});

app.use("/unauth", unauth_router)

//router for authenticated user requests
//auth middleware yet to be added
app.use("/auth", authenticate, auth_router);



app.listen(process.env.PORT, (error) =>{
    if(!error)
        console.log(`Server available on http://localhost:${process.env.PORT}`)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

export default app;