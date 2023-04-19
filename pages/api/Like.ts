import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongoDB } from "@/middlewares/ConnectMongoDB";
import { corsPolicy } from "@/middlewares/CorsPolicy";
import { tokenJWTValidation } from "@/middlewares/TokenJWTValidation";
import { PostModel } from "@/models/PostModel";
import { UserModel } from "@/models/UserModel";
import type { StandardResponseMsg } from "@/types/StandardResponseMsg";

const likeEndpoint 
    = async (req : NextApiRequest, res : NextApiResponse<StandardResponseMsg>) => {

    try {
        if(req.method === 'PUT'){
            // post ID checked
            const {id} = req?.query;
            const post= await PostModel.findById(id);
            if(!post){
                return res.status(400).json({error : 'Post unavailable'});
            }

            // user id (liking the picture)          
            const {userId} = req?.query;
            const user = await UserModel.findById(userId);
            if(!user){
                return res.status(400).json({error : 'User not found'});
            }
            
            const indexUserLike = post.likes.findIndex((e : any) => e.toString() === user._id.toString());

            // if index > -1  user already like the post
            if(indexUserLike != -1){
                post.likes.splice(indexUserLike, 1);
                await PostModel.findByIdAndUpdate({_id : post._id}, post);
                return res.status(200).json({msg : 'Disliked'});
            }else {
                //if index =-1  user dont like post yet
                post.likes.push(user._id);
                await PostModel.findByIdAndUpdate({_id : post._id}, post);
                return res.status(200).json({msg : 'Liked'});
            }
        }

        return res.status(405).json({error : 'Invalid method'});
    }catch(e){
        console.log(e);
        return res.status(500).json({error : 'Liking or diliking post failed'});
    }
}

export default corsPolicy(tokenJWTValidation(connectMongoDB(likeEndpoint)));