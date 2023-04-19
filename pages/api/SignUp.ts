import type { NextApiRequest, NextApiResponse } from "next";
import type { StandardResponseMsg } from "@/types/StandardResponseMsg";
import { UserModel } from "@/models/UserModel";
import { connectMongoDB } from "../../middlewares/ConnectMongoDB";
import md5 from 'md5';
import { uploadImageCosmic,updload } from "@/Services/UploadImageCosmic";
import nc from 'next-connect';
import { SignUpRequest } from "@/types/SignUpRequest";
import { corsPolicy } from "@/middlewares/CorsPolicy";

const handler = nc()
    .use(updload.single('file'))
    .post(async (req : NextApiRequest, res : NextApiResponse<StandardResponseMsg>) => {
        try{
            const user = req.body as SignUpRequest;
        
            if(!user.name || user.name.length < 2){
                return res.status(400).json({error : 'Invalid name'});
            }
    
            if(!user.email || user.email.length < 5
                || !user.email.includes('@')
                || !user.email.includes('.')){
                return res.status(400).json({error : 'Invalid email '});
            }
    
            if(!user.password || user.password.length < 4){
                return res.status(400).json({error : 'Invalid password'});
            }
    
            // check if user is already registered
            const usersWithSameEmail = await UserModel.find({email : user.email});
            if(usersWithSameEmail && usersWithSameEmail.length > 0){
                return res.status(400).json({error : 'email already registered'});
            }

            // send image from multer to cosmic
            const image = await uploadImageCosmic(req);
    
            // save user on data base
            const newUser = {
                nome : user.name,
                email : user.email,
                senha : md5(user.password),
                avatar : image?.media?.url
            }
            await UserModel.create(newUser);
            return res.status(200).json({msg : 'successfully registered user '});
        }catch(e : any){
            console.log(e);
            return res.status(400).json({error : e.toString()});
        }
});

export const config = {
    api: {
        bodyParser : false
    }
}

export default corsPolicy(connectMongoDB(handler));