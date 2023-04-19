import type {NextApiRequest, NextApiResponse} from 'next';
import { connectMongoDB } from '@/middlewares/ConnectMongoDB';
import { corsPolicy } from '@/middlewares/CorsPolicy';
import { tokenJWTValidation } from '@/middlewares/TokenJWTValidation';
import { FollowerModel } from '@/models/FollowerModel';
import { UserModel } from '@/models/UserModel';
import type { StandardResponseMsg } from '@/types/StandardResponseMsg';

const followEndpoint = 
    async (req : NextApiRequest, res : NextApiResponse<StandardResponseMsg>) => {
    try{
        if(req.method === 'PUT'){

            const {userId, id} = req?.query;

            // usuario logged in who wants to follow someone
            const userLoggedIn = await UserModel.findById(userId);
            if(!userLoggedIn){
                return res.status(400).json({error : 'User not found'});
            }

            // id of user to be followed
            const userToBeFollowed = await UserModel.findById(id);
            if(!userToBeFollowed){
                return res.status(400).json({ error : 'User not found'});
            }

            // check if logged user alredy follows the other user
            const alreadyFollowUser = await FollowerModel
                .find({usuarioId: userLoggedIn._id, userFollowedId : userToBeFollowed._id});
            if(alreadyFollowUser && alreadyFollowUser.length > 0){
                
                alreadyFollowUser.forEach(async(e : any) => 
                    await FollowerModel.findByIdAndDelete({_id : e._id}));
                
                userLoggedIn.following--;
                await UserModel.findByIdAndUpdate({_id : userLoggedIn._id}, userLoggedIn);
                userToBeFollowed.followers--;
                await UserModel.findByIdAndUpdate({_id : userToBeFollowed._id}, userToBeFollowed);

                return res.status(200).json({msg : 'User unfollowed'});
            }else{
                // if user is not followed yet, then follow
                const follower= {
                    usuarioId : userLoggedIn._id,
                    usuarioSeguidoId : userToBeFollowed._id
                };
                await FollowerModel.create(follower);

                
                userLoggedIn.following++;
                await UserModel.findByIdAndUpdate({_id : userLoggedIn._id}, userLoggedIn);

                
                userToBeFollowed.followers++;
                await UserModel.findByIdAndUpdate({_id : userToBeFollowed._id}, userToBeFollowed);

                return res.status(200).json({msg : 'User followed'});
            }
        }
        
        return res.status(405).json({error : 'Invalid Method'});
    }catch(e){
        console.log(e);
        return res.status(500).json({error : 'Following/Unfollowing failed'});
    }
}

export default corsPolicy(tokenJWTValidation(connectMongoDB(followEndpoint)));