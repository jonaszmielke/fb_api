import {Router} from 'express';
const auth_router = Router(); 

auth_router.get("/router_test", (req, res) => {

    console.log(`GET request on /auth/router_test from ${req.ip}`)
    res.status(200)
    res.json({message: 'hello router test!'});
});


export default auth_router;