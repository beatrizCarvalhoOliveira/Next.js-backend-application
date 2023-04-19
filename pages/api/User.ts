import type {NextApiRequest, NextApiResponse} from 'next';
import type { StandardResponseMsg } from '@/types/StandardResponseMsg';
import { tokenJWTValidation } from '@/middlewares/TokenJWTValidation';
import { connectMongoDB } from '@/middlewares/ConnectMongoDB';
import { UserModel } from '@/models/UserModel';
import nc from 'next-connect';
import { uploadImageCosmic, updload } from '@/Services/UploadImageCosmic';
import { corsPolicy } from '@/middlewares/CorsPolicy';
import { userAgent } from 'next/server';

const handler = nc()
    .use(updload.single('file'))
    .put(async(req : any, res : NextApiResponse<StandardResponseMsg>) => {
        try{
            const {userId} = req?.query;
            const user = await UserModel.findById(userId);
            
            if(!user){
                return res.status(400).json({error : 'User not Found'});
            }

            const {name} = req?.body;
            if(name && name.length > 2){
                user.name = name;
            }

            const {file} = req;
            if(file && file.originalname){
                const image = await uploadImageCosmic(req);
                if(image && image.media && image.media.url){
                    user.avatar = image.media.url;
                } 
            }

            await UserModel.findByIdAndUpdate({_id : user._id}, user);

            return res.status(200).json({msg : 'User profile Updated'});
        }catch(e){
            console.log(e);
            return res.status(400).json({error : 'Profile update failed:' + e});
        }
    })
    .get(async (req : NextApiRequest, res : NextApiResponse<StandardResponseMsg | any>) => {
        try{
            const {userId} = req?.query;
            const user = await UserModel.findById(userId);
            console.log('user', user);
            user.password = null;
            return res.status(200).json(user);
        }catch(e){
            console.log(e);
        }
    
        return res.status(400).json({error : 'Falied getting user profile'})
    });

export const config = {
    api : {
        bodyParser : false
    }
}

export default corsPolicy(tokenJWTValidation(connectMongoDB(handler)));