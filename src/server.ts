require('dotenv').config({path: '.env'});
process.env['UV_THREADPOOL_SIZE'] = '32';

import express from 'express';
import unauth_router from './unauthenticated';
import auth_router from './authenticated/auth_main';
import {authenticate} from './middleware';

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//router for unauthenticated user requests
//like log in and account creation
app.use("/unauth", unauth_router)

//router for authenticated user requests
app.use("/auth", authenticate, auth_router);


app.listen(process.env.PORT, (error) =>{
    if(!error)
        console.log(`Server available on http://localhost:${process.env.PORT}`)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

export default app;