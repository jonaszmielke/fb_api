import prisma from "../db";
import {Router} from 'express';
import { findPost } from "./like";
import multer from "multer";
const post_router = Router();

import { saveImage } from "../imageService";

const upload = multer({ dest: '../temp/' });

post_router.get("/:postid", async (req, res) => {

    const postid = parseInt(req.params.postid);

    if(!postid){
        res.status(400);
        res.json({error: "Bad request, please provide desired post's id"});
        return;
    }

    const post = await prisma.post.findUnique({
        where: {id: postid},
        select: {
            id: true,
            text: true,
            imageUrl: true,
            createdAt: true,
            owner: {select:{
                id: true,
                name: true,
                surname: true,
                profilePictureUrl: true
            }}
        },
    });

    if(!post){
        res.status(404);
        res.json({error: `Post of id ${postid} does not exist`});
        return;
    }

    const likeCount = await prisma.like.count({
        where: { postId: postid }
    });

    const isLikedByUser = await prisma.like.findUnique({
        where: { postId_ownerId: {
                postId: postid,
                ownerId: req.user.id,
            }}
    });

    const commentCount = await prisma.comment.count({
        where: { postId: postid }
    });

    res.status(200);
    res.json({
        ...post,
        likeCount: likeCount,
        isLikedByUser: !!isLikedByUser,
        commentCount: commentCount
    });
});

post_router.post("/", upload.single('image'), async (req, res) => {
    if (!req.body.text) {
        res.status(400).send("Incorrect post data");
        return;
    }
    try {
        let post;
        if (req.file) {
            const uniqueName = await saveImage(req.file, 'post');
            post = await prisma.post.create({
                data: {
                    owner: { connect: { id: req.user.id } },
                    text: req.body.text,
                    imageUrl: uniqueName
                }
            });
        } else {
            post = await prisma.post.create({
                data: {
                    owner: { connect: { id: req.user.id } },
                    text: req.body.text,
                }
            });
        }
        res.status(200).json({
            message: "Successfully uploaded a post",
            postid: post.id
        });
    } catch (error) {
        res.status(500).send("Server error");
    }
});

post_router.put("/:postid", upload.single('image'), async (req, res) => {
    const postid = parseInt(req.params.postid);
    const new_text = req.body.text;
    if (!new_text && !req.file) {
        res.status(400).send("Incorrect post data");
        return;
    }
    const existing_post = await prisma.post.findUnique({ where: { id: postid } });
    if (!existing_post) {
        res.status(404).send(`Post of id ${postid} does not exist`);
        return;
    }
    if (req.user.id !== existing_post.ownerId) {
        res.status(401).json({ message: "You do not own this post" });
        return;
    }
    try {
        if (new_text) {
            await prisma.post.update({
                where: { id: postid },
                data: { text: new_text }
            });
        }
        if (req.file) {
            const uniqueName = await saveImage(req.file, 'post');
            await prisma.post.update({
                where: { id: postid },
                data: { imageUrl: uniqueName }
            });
        }
        res.status(200).json({
            message: `Successfully changed post ${postid}`,
            previousText: existing_post.text,
            newText: new_text
        });
    } catch (error) {
        res.status(500).send("Server error");
    }
});



post_router.delete("/:postid", async (req, res) => {

    const postid = parseInt(req.params.postid);
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


post_router.get("/isliked/:postid", async (req, res) => {

    const post = await findPost(req, res);
    if(post){

        const like = await prisma.like.findUnique({
            where: { postId_ownerId: {
                    postId: post.id,
                    ownerId: req.user.id,
                }}
        });
        if(like){
            
            res.status(200);
            res.json({
                "isLiked": true,
                "postId": like.postId,
                "likeId": like.id
            });
        } else {

            res.status(200);
            res.json({
                "isLiked": false,
                "postId": post.id,
            });
        }
    }
});


export default post_router;