import prisma from "../db";
import {Router} from 'express';
import post_router from "./post";
import like_router from "./like";
import user_router from "./user";
import comment_router from "./comment";
const auth_router = Router();


auth_router.use("/user", user_router);
auth_router.use("/post", post_router);
auth_router.use("/like", like_router)
auth_router.use("/comment", comment_router)


auth_router.post("/fyp_posts", async (req, res) => {

    const idsToOmit: number[] = req.body.omit;

    if(!idsToOmit || idsToOmit.length === 0){

        try{
            const posts = await prisma.post.findMany({
    
                orderBy: {createdAt: 'desc'},
                take: 5,
                select: {
                    id: true
                }
            });
    
            const ids = [];
            posts.map( (post) => {
                ids.push(post.id)
            })
            res.status(200);
            res.json(ids);
        
        } catch (error) {
    
            console.log(`Error fetching 5 posts for fyp\n${error}`);
            res.status(500);
            res.json({error: "Internal server error"});
        }

    } else {

        try{
            const posts = await prisma.post.findMany({
    
                where: {
                    id: {
                        notIn: idsToOmit
                    }},
                orderBy: {createdAt: 'desc'},
                take: 5,
                select: {
                    id: true
                }
            });

            const ids = [];
            posts.map( (post) => {
                ids.push(post.id)
            })
            res.status(200);
            res.json(ids);

        } catch (error) {

            console.log(`Error fetching 5 posts for fyp\n${error}`);
            res.status(500);
            res.json({error: "Internal server error"});
        }
    }
})

export default auth_router;