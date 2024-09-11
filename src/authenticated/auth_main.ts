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


auth_router.get("/fyp_posts", async (req, res) => {

    const idsToOmit = JSON.parse(req.query.omit || '[]');
    let error:string;
    let posts;

    if(!idsToOmit || idsToOmit.length === 0){
        try{

            posts = await prisma.post.findMany({
    
                orderBy: {createdAt: 'desc'},
                take: 5,
                select: {
                    id: true
                }
            });

        } catch (e){
            error = `Error fetching 5 posts for fyp\n${e}`;
        }

    } else {
        try{

            posts = await prisma.post.findMany({
    
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

        } catch (e) {
            error = `Error fetching 5 posts for fyp\nOmit: ${idsToOmit}\n${e}`;
        }
    }
    

    if(error){
        console.log(error);
        res.status(500);
        res.json({message: 'Internal server error'});
        return;
    }

    const ids:number[] = [];
    posts.map( (post) => {
        ids.push(post.id)
    })

    if(!ids || ids.length === 0){

        res.status(200);
        res.json({allPostsDepleted: true});
        return;
    }

    console.log(`Posts returned: ${posts.map( (p) => {return p.id})}\nPosts omitted: ${idsToOmit}\n`);
    res.status(200);
    res.json({
        'postids': ids,
        'allPostsDepleted': false
    });
})

export default auth_router;