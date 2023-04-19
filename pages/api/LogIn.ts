import type {NextApiRequest, NextApiResponse} from 'next';
import { connectMongoDB } from '@/middlewares/ConnectMongoDB';
import type { StandardResponseMsg } from '@/types/StandardResponseMsg';
import type { LoginResponse } from '@/types/LogInResponse';
import md5 from 'md5';
import { UserModel } from '@/models/UserModel'; 
import jwt from 'jsonwebtoken';
import { corsPolicy } from '@/middlewares/CorsPolicy';

const endpointLogin = async (
    req : NextApiRequest,
    res : NextApiResponse<StandardResponseMsg | LoginResponse>) => {

    const {MY_JWT_KEY} = process.env;
    if(!MY_JWT_KEY){
        return res.status(500).json({error : 'ENV Jwt not informed'});
    }

    if(req.method === 'POST'){
        const {login, password} = req.body;

        const userSearch = await UserModel.find({email : login, password : md5(password)});
        if(userSearch && userSearch.length > 0){
            const userFound = userSearch[0];

            const token = jwt.sign({_id : userFound._id}, MY_JWT_KEY);
            return res.status(200).json({
                name : userFound.name, 
                email : userFound.email, 
                token});
        }
        return res.status(400).json({error : 'User or password not found'});
    }
    return res.status(405).json({error : 'Invalid method'});
}

export default corsPolicy(connectMongoDB(endpointLogin));