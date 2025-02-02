import prisma from "../db";
import {Router} from 'express';
import CreateUpload from "../storage";
const user_router = Router();
const upload = CreateUpload("profile_pictures");

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
    const includeMutualFriends = req.query.includeMutualFriends === 'true';
    if (user) {
        
        let mutualFriendsCount = null;

        if (includeMutualFriends){
            // Query for mutual friends count
            mutualFriendsCount = await prisma.friendship.count({
                where: {
                    OR: [
                        {
                            userId: req.user.id,
                            friendId: user.id,
                        },
                        {
                            userId: user.id,
                            friendId: req.user.id,
                        },
                    ],
                },
            });
        }

        res.status(200);
        res.json({
            "id": user.id,
            "name": user.name,
            "surname": user.surname,
            "profile_picture": user.profilePictureUrl,
            "joined": user.createdAt,
            ...(includeMutualFriends && { mutual_friends: mutualFriendsCount }), // Include only if requested
        });
    }
    
});


user_router.get("/posts/:userid", async (req, res) => {

    const user = await checkIfUserExists(req, res);
    const requestedUserId = parseInt(req.params.userid);

    if (user){
        const idsToOmit = JSON.parse(req.query.omit || '[]');
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

        console.log(postids);
        res.status(200);
        res.json({'postids': postids});
    }
});


user_router.get("/friends/:userid", async (req, res) => {

    const user = await checkIfUserExists(req, res);
    //console.log(`friend request, requesting userid: ${req.user.id}`)
    if (user) {

        const friends = await prisma.user.findUnique({
            where: { id: user.id },
            select: { friends: { select: {
                id: true, //id of a friendship
                friend: { select: {
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


user_router.post("/profile_picture", upload.single('image'), async (req, res) =>{

    if(!req.file){
        res.status(400);
        res.send("Incorrect image");
        return;
    }

    const user = await prisma.user.update({
        where: {id: req.user.id},
        data: {profilePictureUrl: req.file.filename}
    });

    res.status(200);
    res.json({'message': 'Profile picture updated succesfuly'});
});


export default user_router;