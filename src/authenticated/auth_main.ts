import prisma from "../db";
import {Router} from 'express';
import post_router from "./post";
import like_router from "./like";
import user_router from "./user";
const auth_router = Router();


auth_router.use("/post/like", like_router)
auth_router.use("/post", post_router);
auth_router.use("/user", user_router);







auth_router.get("/fyp_posts", async (req, res) => {

    try{

        const posts = await prisma.post.findMany({

            orderBy: {createdAt: 'desc'},
            take: 5
        });

        res.status(200);
        res.json(posts);
    
    } catch (error) {

        console.log(`Error fetching 5 posts for fyp\n${error}`);
        res.status(500);
        res.json({error: "Internal server error"});
    }
})

export default auth_router;