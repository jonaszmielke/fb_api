import prisma from "../db";
import {Router} from 'express';
const like_router = Router();


export async function findPost(req, res) {

    const postid = parseInt(req.params.postid);
    if(!postid){

        res.status(400)
        res.json({ error: 'Invalid postid parameter' });
        return;
    }
    const post = await prisma.post.findUnique({
        where: {id: postid}
    });

    if(!post){
        res.status(404)
        res.json({ error: `Post ${postid} does not exist` });
        return;
    }
    return post;
}


like_router.post("/:postid", async (req, res) => {

    const post = await findPost(req, res);

    if(post){

        try{
            await prisma.like.create({
                data:{
                    postId: post.id,
                    ownerId: req.user.id
                }
            });
            res.status(200);
            res.json({message: `Successfuly liked post ${post.id}`});
            
        } catch (e){
            //console.log(e);
            res.status(400);
            res.json({error: `Post ${post.id} is already liked by user ${req.user.id}`});
        }
    }
});


like_router.delete("/:postid", async (req, res) => {

    const postid = parseInt(req.params.postid);
    if(!postid){
        res.status(400)
        res.json({ error: 'Invalid postid parameter'});
        return;
    }

    try{
        await prisma.like.delete({
            where: {
                postId_ownerId: {
                    postId: postid,
                    ownerId: req.user.id
                }
            }
        });
        res.status(200);
        res.json({message: `Successfuly unliked post ${postid}`});

    } catch (e){
        //console.log(e);
        res.status(404);
        res.json({error: `Post ${postid} is not liked by user ${req.user.id}`});
    }
});

export default like_router;