import prisma from "../db";
import {Router} from 'express';
const user_router = Router();

async function checkIfUserExists(req, res) {

    let userid = req.params.userid.substring(1);
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
            "joined": user.createdAt
        });
    }
    
});


user_router.get("/posts/:userid", async (req, res) => {

    const user = await checkIfUserExists(req, res);
    if (user){

        const posts = await prisma.post.findMany({

            where: {ownerId: user.id},
            orderBy: {createdAt: 'desc'},
            take: 5
        });

        res.status(200);
        res.json(posts);
    }   
});


user_router.get("/friends/:userid", async (req, res) => {

    const user = await checkIfUserExists(req, res);
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
                "friend": {
                    "id": element.friend.id,
                    "name": element.friend.name,
                    "surname": element.friend.surname,
                    "profilePictureUrl": element.friend.profilePictureUrl
                }
            };
            output.push(out);
        });
    
        res.status(200);
        res.json(output);
    }
});


export default user_router;