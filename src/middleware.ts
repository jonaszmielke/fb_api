import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const bearer = req.headers.authorization;

    if(!bearer){
        res.status(401);
        res.send("Not authorized");
        return;
    }

    const[, token] = bearer.split(' ');
    if(!token){
        res.status(401);
        res.send("No token");
        return;
    }

    try{

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