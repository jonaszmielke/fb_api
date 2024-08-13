import prisma from "../db";
import {Router} from 'express';
const user_router = Router();


user_router.get("/posts:userid", async (req, res) => {

    const userid = req.params.userid;

    if(await prisma.user.findUnique({where: {id: userid}}) == null){

        res.status(404);
        res.json({error: `User of id ${userid} does not exist`});
        
    } else {

        try{

            const posts = await prisma.post.findMany({
    
                where: {ownerId: userid},
                orderBy: {createdAt: 'desc'},
                take: 5
            });

            res.status(200);
            res.json(posts);

        } catch (error) {
    
            console.log(`Error fetching 5 userid = ${userid} posts for fyp\n${error}`);
            res.status(500);
            res.json({error: "Internal server error"});
        }
    }
});


export default user_router;