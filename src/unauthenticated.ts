import prisma from "./db";
import app from "./server";
import crypto from "crypto";
import jwt from 'jsonwebtoken';
import {Router} from 'express';
import { error } from "console";
const unauth_router = Router();

function hashPassword(password:string){
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



unauth_router.post("/signin", async (req, res) => {

    if(!req.body.email || !req.body.password){
        res.status(400).json({"error": "email and password are needed"});
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: req.body.email }
        });
        
        if(user.password === hashPassword(req.body.password)){
        
            req.user = user;
            const token = createJWT(user); 
    
            res.status(200);
            res.json({
            
                message: `Welcome ${user.name}, successfully signed in!`,
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    surname: user.surname,
                    profilePictureUrl: user.profilePictureUrl,
                    backgroundUrl: user.backgroundUrl,
                    createdAt: user.createdAt
                }

            });
        
        } else res.status(401).json({error: true, message: "Wrong credentials"});

    } catch (error) {
        //console.error("Error fetching user:", error);
        res.json({error: true, message: "Wrong credentials"});
    }
});


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
        res.json({'message': "Successfully signed up"});

    } else {

        res.status(400);
        res.send("Incorrect user data")
    }
});

export default unauth_router;