import prisma from "../db";
import {Router} from 'express';
import multer from 'multer';

import { saveImage } from "../imageService";


const user_router = Router();
const upload = multer({ dest: '../temp/' });

async function checkIfUserExists(req, res) {

    let userid = req.params.userid;
    if(isNaN(userid) || userid === undefined){

        res.status(400)
        res.json({ error: 'Invalid userid parameter'});
        return;
    }
    userid = parseInt(userid);
    const user = await prisma.user.findUnique({
        where: {id: userid}
    });

    if(!user){
        res.status(404)
        res.json({ error: `User ${userid} does not exist`});
        return;
    }
    return user;
}


user_router.get("/:userid", async (req, res) =>{

    const user = await checkIfUserExists(req, res);
    if (user) {

        res.status(200);
        res.json({
            "id": user.id,
            "name": user.name,
            "surname": user.surname,
            "profile_picture": user.profilePictureUrl,
            "joined": user.createdAt,
        });
    } else {

        res.status(404);
        res.json({message: 'User not found'});
    }
});



user_router.get("/data/:userid", async (req, res) => {

    const user = await checkIfUserExists(req, res);

    if (user) {

        const friends_ammount = await prisma.friendship.count({
            where: {userId: user.id}
        });
    
        const mutual_friends_ammount = await prisma.friendship.count({
            where: {
                OR: [
                    {userId: req.user.id, friendId: user.id,},
                    {userId: user.id, friendId: req.user.id,},
                ],
            },
        });
    
        const friends_query = await prisma.friendship.findMany({
            where: {
                userId: user.id
            },
            take: 20,
            orderBy: {createdAt: 'desc'},
            include: {
                friend: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        profilePictureUrl: true,
                        createdAt: true
            }}}
        });
        const friends = friends_query.map(f => f.friend);
        

        //friendship status
        let friendship_status = "not_friends";
        let requestid = null;
        const is_friend = await prisma.friendship.findFirst({
            where: {
                userId: req.user.id,
                friendId: user.id
            }
        });

        if (is_friend) friendship_status = "friends";
        else{

            const invited_them = await prisma.friendRequest.findFirst({
                where: {
                    senderId: req.user.id,
                    receiverId: user.id
                }
            });

            if (invited_them) {
                friendship_status = "invited_them";
                requestid = invited_them.id;
            }    
            else{

                const they_invited = await prisma.friendRequest.findFirst({
                    where: {
                        senderId: user.id,
                        receiverId: req.user.id
                    }
                });

                if (they_invited) {
                    friendship_status = "they_invited";
                    requestid = they_invited.id;
                }
            }
        }

        
        res.status(200);
        res.json({
            id: user.id,
            name: user.name,
            surname: user.surname,
            friendship_status: friendship_status,
            friend_request_id: requestid,
            profile_picture_url: user.profilePictureUrl,
            friends_ammount: friends_ammount,
            mutual_friends_ammount: mutual_friends_ammount,
            friends: friends
        });

    }
});









user_router.get("/posts/:userid", async (req, res) => {

    const user = await checkIfUserExists(req, res);
    const requestedUserId = parseInt(req.params.userid);

    if (user){

        const omitQuery = typeof req.query.omit === 'string' ? req.query.omit : '[]';
        const idsToOmit = JSON.parse(omitQuery);

        let error:string;
        let result;
    
        if(!idsToOmit || idsToOmit.length === 0){
            try{
    
                result = await prisma.post.findMany({
        
                    where: {
                        ownerId: requestedUserId,
                    },
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
    
                result = await prisma.post.findMany({
        
                    where: {
                        ownerId: requestedUserId,
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


        const postids:number[] = [];
        for (const post of result){
            postids.push(post.id);
        }

        if(!postids || postids.length === 0){
            res.status(200);
            res.json({allPostsDepleted: true});
            return;
        }

        //console.log(postids);
        res.status(200);
        res.json({'postids': postids});
    }
});


user_router.get("/posts/list/:userid", async (req, res) =>{

    const user = await checkIfUserExists(req, res);
    const pageStr = typeof req.query.page === 'string' ? req.query.page : '0';
    const page = parseInt(pageStr, 10) || 0;
    const query = await prisma.post.findMany({
        where: {ownerId: user.id},
        orderBy: {createdAt: 'desc'},
        take: 6,
        skip: page * 5,
        select: {id: true}
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




user_router.get("/friends/:userid", async (req, res) => {

    const user = await checkIfUserExists(req, res);
    if (user) {

        const friends = await prisma.user.findUnique({
            where: { id: user.id },
            select: { 
                friends: { 
                    take: 9, // Limit to 9 users
                    select: {
                        id: true, // ID of a friendship
                        
                        friend: { 
                            select: {
                                id: true,
                                name: true,
                                surname: true,
                                profilePictureUrl: true
            }}}}}
        });
        const output = [];
        friends.friends.forEach(element => {
            
            const out = {
                "friendshipId": element.id,
                "id": element.friend.id,
                "name": element.friend.name,
                "surname": element.friend.surname,
                "profilePictureUrl": element.friend.profilePictureUrl
            };
            output.push(out);
        });
    
        res.status(200);
        res.json(output);
    }
});


user_router.get("/friends/list/:userid", async (req, res) => {

    const user = await checkIfUserExists(req, res);
    const pageStr = typeof req.query.page === 'string' ? req.query.page : '0';
    const page = parseInt(pageStr, 10) || 0;
    const query = await prisma.friendship.findMany({
        where: {
            userId: user.id
        },
        take: 21,
        skip: 20 * page,
        include: {
            friend: {
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    profilePictureUrl: true,
                    createdAt: true
                }
            }
        }
    });

    let hasMore = false;
    // Extract only the friend object from each friendship record
    const friends = query.map(f => f.friend);
    if (friends.length === 21){
        hasMore = true;
        friends.pop();
    }

    res.status(200);
    res.json({
        list: friends,
        nextPage: page + 1,
        hasMore: hasMore
    });
});



user_router.post("/profile_picture", upload.single('image'), async (req, res) => {
    if (!req.file) {
        res.status(400).send("Incorrect image");
        return;
    }

    try {
        // Save the image using the reusable function and get the new unique filename.
        const uniqueName = await saveImage(req.file, 'profile_picture');

        // Update the user in the database with the new profile picture filename.
        await prisma.user.update({
            where: { id: req.user.id },
            data: { profilePictureUrl: uniqueName }
        });

        res.status(200).json({ message: 'Profile picture updated successfully' });
    } catch (error) {
        console.error("Error saving image:", error);
        res.status(500).send("Server error");
    }
});

user_router.post("/background", upload.single('image'), async (req, res) => {
    if (!req.file) {
        res.status(400).send("Incorrect image");
        return;
    }
    try {
        const uniqueName = await saveImage(req.file, 'background');
        await prisma.user.update({
            where: { id: req.user.id },
            data: { backgroundUrl: uniqueName }
        });
        res.status(200).json({ message: 'Background updated successfully' });
    } catch (error) {
        console.error("Error saving image:", error);
        res.status(500).send("Server error");
    }
});


export default user_router;