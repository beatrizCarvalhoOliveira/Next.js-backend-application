import type {NextApiRequest, NextApiResponse} from 'next';
import { connectMongoDB } from '@/middlewares/ConnectMongoDB';
import { corsPolicy } from '@/middlewares/CorsPolicy';
import { tokenJWTValidation } from '@/middlewares/TokenJWTValidation';
import { PostModel } from '@/models/PostModel';
import { UserModel } from '@/models/UserModel';
import type { StandardResponseMsg } from '@/types/StandardResponseMsg';

const commentEndpoint = async (req : NextApiRequest, res : NextApiResponse<StandardResponseMsg>) => {
    try{
        if(req.method === 'PUT'){
            const {userId, id} = req.query;
            const userLoggedIn = await UserModel.findById(userId);
            if(!userLoggedIn){
                return res.status(400).json({error : 'User not found'});
            }
            
            const post =  await PostModel.findById(id);
            if(!post){
                return res.status(400).json({error : 'Post unavailable'});
            }

            if(!req.body || !req.body.comentario
                || req.body.comentario.length < 2){
                return res.status(400).json({error : 'Invalid comment'});
            }

            const comment = {
                userId : userLoggedIn._id,
                name : userLoggedIn.name,
                comment : req.body.comment
            }

            post.comment.push(comment);
            await PostModel.findByIdAndUpdate({_id : post._id}, post);
            return res.status(200).json({msg : 'Comment added'});
        }
        
        return res.status(405).json({error : 'Invalid Method'});
    }catch(e){
        console.log(e);
        return res.status(500).json({error : 'Comment failed'});
    }
}

export default corsPolicy(tokenJWTValidation(connectMongoDB(commentEndpoint)));