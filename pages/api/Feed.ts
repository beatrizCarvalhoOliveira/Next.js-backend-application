import type {NextApiRequest, NextApiResponse} from 'next';
import type { StandardResponseMsg } from '@/types/StandardResponseMsg';
import { tokenJWTValidation } from '@/middlewares/TokenJWTValidation';
import { connectMongoDB } from '@/middlewares/ConnectMongoDB';
import { UserModel } from '@/models/UserModel';
import { PostModel } from '@/models/PostModel';
import { FollowerModel } from '@/models/FollowerModel';
import { corsPolicy } from '@/middlewares/CorsPolicy';

const feedEndpoint = async (req : NextApiRequest, res : NextApiResponse<StandardResponseMsg | any>) => {
    try{
        if(req.method === 'GET'){
            if(req?.query?.id){
                // validating user
                const user = await UserModel.findById(req?.query?.id);
                if(!user){
                    return res.status(400).json({error : 'User not found'});
                }

                // searching for user posts
                const posts = await PostModel
                    .find({idUser : user._id})
                    .sort({postDate : -1});

                return res.status(200).json(posts);
            }else{
                const {userId} = req.query;
                const userLoggedIn = await UserModel.findById(userId);
                if(!userLoggedIn){
                    return res.status(400).json({error : 'User not found'});
                }

                const followers = await FollowerModel.find({userId : userLoggedIn._id});
                const followersIds = followers.map(s => s.userFollowedId);

                const posts = await PostModel.find({
                    $or : [
                        {idUser : userLoggedIn._id},
                        {idUser : followersIds}
                    ]
                })
                .sort({postDate : -1});

                const result = [];
                for (const post of posts) {
                   const userPost = await UserModel.findById(post.idUser);
                   if(userPost){
                        const final = {...post._doc, user : {
                            name : userPost.name,
                            avatar : userPost.avatar
                        }};
                        result.push(final);  
                   }
                }

                return res.status(200).json(result);
            }
        }
        return res.status(405).json({error : 'Invalid method'});
    }catch(e){
        console.log(e);
    }
    return res.status(400).json({erro : 'Failed to get feed'});
}

export default corsPolicy(tokenJWTValidation(connectMongoDB(feedEndpoint)));