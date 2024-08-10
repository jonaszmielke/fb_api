import prisma from "./db";
import app from "./server";
import crypto from "crypto";
import jwt from 'jsonwebtoken';
import {Router} from 'express';
const unauth_router = Router();

function hashPassword(password){
    const result = crypto.createHash("sha3-256")
        .update(password)
        .digest("hex")
    
    return result;
}

function createJWT(user){
    const token = jwt.sign({
            id: user.id, 
            name: user.name,
            surname: user.surname
        },
        process.env.JWT_SECRET
    );
    
    return token;
}



unauth_router.get("/signin", async (req, res) => {

    const user = await prisma.user.findUnique({
        where: {
            email: req.body.email
        }
    })

    if(user.password == hashPassword(req.body.password)){
        
        req.user = user;
        const token = createJWT(user); 

        res.status(200);
        res.json({
        
            message: `Welcome ${user.name}, successfully signed in!`,
            token: token
        });
    
    } else {

        res.status(401);
        res.send("Wrong credentials");

    }
})

unauth_router.post("/signup", async (req, res) =>{

    if(req.body.name, req.body.surname, req.body.email, req.body.password){

        const user = await prisma.user.create({
            data:{
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                password: hashPassword(req.body.password)
            }
        });

        res.status(200);
        res.json({message: "Successfully signed up"});

    } else {

        res.status(400);
        res.send("Incorrect user data")
    }
})

export default unauth_router;