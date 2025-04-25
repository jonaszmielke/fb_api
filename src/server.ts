require('dotenv').config({path: '.env'});
//process.env['UV_THREADPOOL_SIZE'] = '32';

import express from 'express';
import unauth_router from './unauthenticated';
import auth_router from './authenticated/auth_main';
import {authenticate, log} from './middleware';
import cors from 'cors';
const app = express();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});


const unauth_cors = ((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const auth_cors = (cors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/app_images', express.static('app_images'));

//router for unauthenticated user requests
//like log in and account creation
app.use("/unauth", unauth_cors, unauth_router)

//router for authenticated user requests
app.use("/api", [auth_cors, authenticate, log], auth_router);


app.listen(process.env.PORT, (error) =>{
    if(!error)
        console.log(`Server available on http://localhost:${process.env.PORT}`)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

export default app;