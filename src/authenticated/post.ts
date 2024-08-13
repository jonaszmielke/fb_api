import prisma from "../db";
import {Router} from 'express';
const post_router = Router();



post_router.get("/:postid", async (req, res) => {

    console.log("dupa");
    const postid = parseInt(req.params.postid.substring(1));
    const post = await prisma.post.findUnique({

        where: {id: postid}
    });

    if(post == null){

        res.status(404);
        res.json({error: `Post of id ${postid} does not exist`});

    } else {

        res.status(200);
        //res.json(post);
        res.json({message: "dupa"})
    }
});


post_router.post("/", async (req, res) => {

    if(req.body.text){
        await prisma.post.create({
            data:{
                owner:{
                    connect:{id: req.user.id}
                },
                text: req.body.text,
            }
        });

        res.status(200);
        res.json({message: "Successfully uploaded a post"});
    } else {

        res.status(400);
        res.send("Incorrect post data")
    }
});


post_router.put("/:postid", async (req, res) => {

    const postid = parseInt(req.params.postid.substring(1));
    const new_text = req.body.text;

    if(!new_text){

        res.status(400);
        res.send("Incorrect post data")
        return;
    }

    const existing_post = await prisma.post.findUnique({
        where: {id: postid}
    });

    if(!existing_post){
            
        res.status(404);
        res.send(`Post of id ${postid} does not exist`);
        return;
    }

    if(req.user.id !== existing_post.ownerId){
        
        res.status(401);
        res.json({message: "You do not own this post"});
        return;
    }

    await prisma.post.update({
        where: {id: postid},
        data: {
            text: new_text
        }
    });

    res.status(200);
    res.json({
        "message": `Successfully changed text of post ${postid}`,
        "previous text": existing_post.text,
        "new_text": new_text
    });
});


post_router.delete("/:postid", async (req, res) => {

    const postid = parseInt(req.params.postid.substring(1));
    const post = await prisma.post.findUnique({
        where: {id: postid}
    });

    if(!post){

        res.status(404);
        res.send(`Post of id ${postid} does not exist`);
        return;
    }

    if(req.user.id !== post.ownerId){

        res.status(401);
        res.json({message: "You do not own this post"});
        return;
    }

    await prisma.post.delete({
        where: {id: postid}
    });

    res.status(200);
    res.json({
        "message": `Successfully deleted a post`,
        "post": post
    });
});


export default post_router;