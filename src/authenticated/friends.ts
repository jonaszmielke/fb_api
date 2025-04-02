import prisma from "../db";
import {Router} from 'express';
const friends_router = Router();

friends_router.get("/", async (req, res) => {

    const pageStr = typeof req.query.page === 'string' ? req.query.page : '0';
    const page = parseInt(pageStr, 10) || 0;
    const friend_requests = await prisma.friendRequest.findMany({
        where: {receiverId: req.user.id},
        skip: page * 20,
        take: 21,
        orderBy: [
            {createdAt: 'desc'},
            {id: 'desc'}
        ],
        select: {
            id: true,
            createdAt: true,
            sender: {
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    profilePictureUrl: true,
                    _count: {
                        select: {
                            friends: {
                                where: {
                                    friendId: req.user.id
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    let hasMore = false;
    if (friend_requests.length === 21){
        hasMore = true;
        friend_requests.pop();
    }

    res.status(200);
    res.json({
        list: friend_requests.map(request => {
            const { _count, ...sender } = request.sender;
            return {
                ...request,
                sender,
                mutualFriendsCount: _count.friends
            };
        }),
        nextPage: page + 1,
        hasMore: hasMore
    });
});


friends_router.post("/invite", async (req, res) => {

    const sender = req.user;

    const receiverIdParam = req.query.receiverid;
    const receiveridStr = typeof receiverIdParam === 'string' ? receiverIdParam : "";
    const receiverid = parseInt(receiveridStr, 10);

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

    const friendrequestidParam = req.query.friendrequestid;
    const friendrequestidStr = typeof friendrequestidParam === 'string' ? friendrequestidParam : "";
    const friendrequestid = parseInt(friendrequestidStr, 10);

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


friends_router.post("/reject", async (req, res) => {

    const friendrequestidParam = req.query.friendrequestid;
    const friendrequestidStr = typeof friendrequestidParam === 'string' ? friendrequestidParam : "";
    const friendrequestid = parseInt(friendrequestidStr, 10);

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

    if (!friendrequest) {
        res.status(404).json({error: `Friend request ${friendrequestid} does not exist`});
        return;
    }

    await prisma.friendRequest.delete({
        where: {id: friendrequestid}
    });

    res.status(200).json({message: 'Friend request rejected'});
});


friends_router.post("/cancel", async (req, res) => {
    
    const friendrequestidParam = req.query.friendrequestid;
    const friendrequestidStr = typeof friendrequestidParam === 'string' ? friendrequestidParam : "";
    const friendrequestid = parseInt(friendrequestidStr, 10);
    
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

    res.status(200).json({message: 'Friend request cancelled'});
});



friends_router.delete("/unfriend", async (req, res) => {

    const friendIdParam = req.query.friend_id;
    const friendIdStr = typeof friendIdParam === 'string' ? friendIdParam : '';
    const friend_id = parseInt(friendIdStr, 10);

    const friendshipIdParam = req.query.friendship_id;
    const friendshipIdStr = typeof friendshipIdParam === 'string' ? friendshipIdParam : '';
    const friendship_id = parseInt(friendshipIdStr, 10);

    if (!friend_id && !friendship_id){
        res.status(400).json({error: `Wrong friend_id ${friend_id} or friendship_id ${friendship_id}`});
        return;
    }

    if (friend_id){ //by friendid
        const friendship = await prisma.friendship.findFirst({
            where: {
                userId: req.user.id,
                friendId: friend_id
            }
        });

        if (!friendship){
            res.status(404).json({error: `Friendship with user ${friend_id} does not exist`});
            return;
        }

        await prisma.friendship.deleteMany({
            where: {
                OR: [
                    {userId: req.user.id, friendId: friend_id},
                    {userId: friend_id, friendId: req.user.id}
                ]
            }
        });

        res.status(200).json({message: 'Friendship deleted'});

    } else { //by friendship_id

        const frienship = await prisma.friendship.findUnique({
            where: {id: friendship_id}
        });

        if (!frienship){
            res.status(404).json({error: `Friendship ${friendship_id} does not exist`});
            return;
        }

        await prisma.friendship.delete({
            where: {id: friendship_id}
        });

        res.status(200).json({message: 'Friendship deleted'});
    }
});

export default friends_router;