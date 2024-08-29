import test from "node:test";
import prisma from "../db";
import {Router} from 'express';
const comment_router = Router();


export async function findPost(req, res) {

    let postid = req.params.postid.substring(1);
    if(isNaN(postid) || postid === undefined){

        res.status(400)
        res.json({ error: 'Invalid postid parameter'});
        return;
    }
    postid = parseInt(postid);
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
});


comment_router.delete("/:commentid", async (req, res) => {

    let commentid = req.params.commentid.substring(1);
    if(isNaN(commentid) || commentid === undefined){

        res.status(400)
        res.json({ error: 'Invalid commentid parameter'});
        return;
    }
    commentid = parseInt(commentid);

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