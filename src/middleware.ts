import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from './db';
import { HttpMethod } from '@prisma/client';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization;

    if (!bearer) {
        res.status(401);
        res.send("Not authorized");
        return;
    }

    const [, token] = bearer.split(' ');
    if (!token) {
        res.status(401);
        res.send("No token");
        return;
    }

    try {

        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();

    } catch (error) {

        console.log(`Unauthorized jwt auth attempt from ${req.ip}\n${token}`);
        res.status(401);
        res.send("Invalid token");
        return;

    }

}


export const log =  async (req: Request, res: Response, next: NextFunction) => {

    const methods: HttpMethod[] = [
        HttpMethod.POST,
        HttpMethod.PUT,
        HttpMethod.PATCH,
        HttpMethod.DELETE
    ];

    if (methods.includes(req.method as HttpMethod)) {
        try{

            await prisma.logs.create({
                data: {
                    userId: req.user.id,
                    method: req.method as HttpMethod,
                    endpoint: req.url,
                    payload: req.body
                }
            })
            console.log('Successfully logged the request!')

        } catch (e){
            console.log('Logging failed', e)
        }
    }
    
    next()
}