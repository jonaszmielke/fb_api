import prisma from "../db";
import {Router} from 'express';
const friends_router = Router();


friends_router.post("/invite", async (req, res) => {

    const sender = req.user;
    const receiverid = parseInt(req.query.receiverid);

    if (!receiverid){
        res.status(400).json({error: `Wrong receiverid ${receiverid}`});
        return;
    }

    const receiver = await prisma.user.findUnique({
        where: {id: receiverid}
    });

    if (!receiver){
        res.status(404).json({error: `User ${receiverid} does not exist`});
        return;
    }

    const friendRequest = await prisma.friendRequest.create({
        data: {
            senderId: sender.id,
            receiverId: receiverid,
            status: 'pending'
        }
    });

    res.status(200).json({message: 'Friend request sent', friendRequestId: friendRequest.id});
});


friends_router.post("/accept", async (req, res) => {

    const friendrequestid = parseInt(req.query.friendrequestid);

    if (!friendrequestid){
        res.status(400).json({error: `Wrong receiverid ${friendrequestid}`});
        return;
    }

    const friendrequest = await prisma.friendRequest.findUnique({
        where: {
            id: friendrequestid,
            status: 'pending'
        }
    });

    if (!friendrequest){
        res.status(404).json({error: `Friend request ${friendrequestid} does not exist`});
        return;
    }

    await prisma.friendRequest.delete({
        where: {id: friendrequestid}
    });

    await prisma.friendship.create({
        data: {
            userId: friendrequest.senderId,
            friendId: friendrequest.receiverId
        }
    });
    await prisma.friendship.create({
        data: {
            userId: friendrequest.receiverId,
            friendId: friendrequest.senderId
        }
    });

    res.status(200).json({message: 'Friend request accepted'});
});

export default friends_router;