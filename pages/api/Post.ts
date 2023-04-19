import type {NextApiResponse} from 'next';
import type { StandardResponseMsg } from '@/types/StandardResponseMsg';
import nc from 'next-connect';
import {updload, uploadImageCosmic} from "../../Services/UploadImageCosmic"
import { connectMongoDB } from '@/middlewares/ConnectMongoDB';
import { tokenJWTValidation } from '@/middlewares/TokenJWTValidation';
import { PostModel } from '@/models/PostModel';
import { UserModel } from '@/models/UserModel';
import { corsPolicy } from '@/middlewares/CorsPolicy';

const handler = nc()
    .use(updload.single('file'))
    .post(async (req : any, res : NextApiResponse<StandardResponseMsg>) => {
        try{
            const {userId} = req.query;
            const user = await UserModel.findById(userId);
            if(!user){
                return res.status(400).json({error : 'User not found'});
            }

            if(!req || !req.body){
                return res.status(400).json({error : 'Input failed'});
            }
            const {caption} = req?.body;

            if(!caption || caption.length < 2){
                return res.status(400).json({error : 'Invalid caption'});
            }
    
            if(!req.file || !req.file.originalname){
                return res.status(400).json({error : 'File not found'});
            }

            const image = await uploadImageCosmic(req);
            const post = {
                idUser : user._id,
                caption,
                picture : image.media.url,
                postDate : new Date()
            }

            user.posts++;
            await UserModel.findByIdAndUpdate({_id : user._id}, user);

            await PostModel.create(post);
            return res.status(200).json({msg : 'Posted successfully'});
        }catch(e){
            console.log(e);
            return res.status(400).json({error : 'Post failed'});
        }
});

export const config = {
    api : {
        bodyParser : false
    }
}

export default corsPolicy(tokenJWTValidation(connectMongoDB(handler))); 