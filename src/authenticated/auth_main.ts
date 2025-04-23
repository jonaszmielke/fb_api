import prisma from "../db";
import {Router} from 'express';
import post_router from "./post";
import like_router from "./like";
import user_router from "./user";
import comment_router from "./comment";
import friends_router from "./friends";
const auth_router = Router();


auth_router.use("/user", user_router);
auth_router.use("/post", post_router);
auth_router.use("/like", like_router)
auth_router.use("/comment", comment_router)
auth_router.use("/friends", friends_router);


auth_router.get("/fyp_posts", async (req, res) => {
   
    const pageStr = typeof req.query.page === 'string' ? req.query.page : '0';
    const page = parseInt(pageStr, 10) || 0;

    const query = await prisma.post.findMany({
        orderBy: [{createdAt: 'desc'}, {id: 'desc'}],
        take: 6,
        skip: page * 5,
        select: { id: true }
    });

    const posts:number[] = [];
    query.forEach((post) => {
        posts.push(post.id);
    });

    let hasMore = false;
    if (posts.length === 6){
        hasMore = true;
        posts.pop();
    }

    res.status(200);
    res.json({
        list: posts,
        nextPage: page + 1,
        hasMore: hasMore
    });
    

});


auth_router.get("/search", async (req, res) => {

    const searchQuery = req.query.query as string;

    const user_results = await prisma.user.findMany({
        where: { 
            OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { surname: { contains: searchQuery, mode: 'insensitive' } }
            ]
        },
        select: { id: true },
        take: 8
    });

    const post_results = await prisma.post.findMany({
        where: {
            text: { contains: searchQuery, mode: 'insensitive' }
        },
        select: { id: true },
        take: 12
    });

    const user_ids = user_results.map(entry => entry.id);
    const post_ids = post_results.map(entry => entry.id);

    res.status(200).json({
        user_results: user_ids,
        post_results: post_ids
    });    

});


export default auth_router;