import prisma from "../db";
import {Router} from 'express';
const like_router = Router();


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


like_router.post("/:postid", async (req, res) => {

    const post = await findPost(req, res);
    if(post){

        const like = await prisma.like.create({
            data:{
                postId: post.id,
                ownerId: req.user.id
            }
        });
        req.status(200);
        req.json({message: `Successfuly liked post ${post.id}`})
    }
});


like_router.delete("/:likeid", async (req, res) => {

    let likeid = req.params.likeid.substring(1);
    if(isNaN(likeid) || likeid === undefined){

        res.status(400)
        res.json({ error: 'Invalid likeid parameter'});
        return;
    }
    likeid = parseInt(likeid);

    const like = await prisma.like.findUnique({
        where: {id: likeid}
    });

    if(!like){
        res.status(404)
        res.json({ error: `Like ${likeid} does not exist`});
        return;
    }

    if(like.ownerId !== req.user.id){
        res.status(401)
        res.json({ error: `You do not own this like`});
        return;
    }

    await prisma.like.delete({
        where: {id: likeid}
    });

    req.status(200);
    req.json({
        "message": `Successfuly removed a like`,
        "postId": like.postId,
        "likeId": like.id
    })
});

export default like_router;