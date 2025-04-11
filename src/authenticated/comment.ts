import prisma from "../db";
import {Router} from 'express';
const comment_router = Router();


export async function findPost(req, res) {

    const postid = parseInt(req.params.postid);
    if(!postid){
        res.status(400);
        res.json({error: "Bad request, please provide desired post's id"});
        return;
    }

    const post = await prisma.post.findUnique({
        where: {id: postid}
    });

    if(!post){
        res.status(404)
        res.json({ error: `Post ${postid} does not exist`});
        return;
    }
    return post;
}

comment_router.get("/:postid", async (req, res) => {

    const post = await findPost(req, res);
    const pageStr = typeof req.query.page === 'string' ? req.query.page : '0';
    const page = parseInt(pageStr, 10) || 0;
    if(post){
        
        const comments = await prisma.comment.findMany({
            where: {postId: post.id},
            skip: page * 10,
            take: 11,
            select: {
                id: true,
                text: true,
                createdAt: true,
                owner: { select: {
                    id: true,
                    name: true,
                    surname: true,
                    profilePictureUrl: true
                }}
            },
            orderBy: [
                { createdAt: 'desc' },
                { id: 'desc' }
            ]
        });

        let hasMore = false;
        if (comments.length === 11){
            hasMore = true;
            comments.pop();
        }

        res.status(200);
        res.json({
            list: comments,
            nextPage: page + 1,
            hasMore: hasMore
        });
    }
});

comment_router.post("/:postid", async (req, res) => {

    if(!req.body.text){
        res.status(400);
        res.json({error: "No comment text provided"});
        return;
    }

    const post = await findPost(req, res);
    if(post){

        const comment = await prisma.comment.create({
            data:{
                postId: post.id,
                ownerId: req.user.id,
                text: req.body.text
            }
        });
        res.status(200);
        res.json({
            message: `Successfuly commented post ${post.id}`,
            comment: comment.text
        })
    }
    else {
        res.status(404);
        res.json({error: "Post not found"});
    }
});


comment_router.delete("/:commentid", async (req, res) => {

    const commentid = parseInt(req.params.commentid);
    if(!commentid){
        res.status(400)
        res.json({ error: 'Invalid commentid parameter'});
        return;
    }

    const comment = await prisma.comment.findUnique({
        where: {id: commentid}
    });

    if(!comment){
        res.status(404)
        res.json({ error: `Comment ${commentid} does not exist`});
        return;
    }

    if(comment.ownerId !== req.user.id){
        res.status(401)
        res.json({ error: `You do not own this comment`});
        return;
    }

    await prisma.comment.delete({
        where: {id: commentid}
    });

    res.status(200);
    res.json({
        "message": `Successfuly removed a comment`,
        "postId": comment.postId,
        "commentId": comment.id,
        "commentText": comment.text
    })
});

export default comment_router;