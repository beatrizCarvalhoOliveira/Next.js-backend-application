import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import type { StandardResponseMsg } from '@/types/StandardResponseMsg';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const tokenJWTValidation = (handler : NextApiHandler) =>
    (req : NextApiRequest, res : NextApiResponse<StandardResponseMsg | any[]>) => {

    try{
        const {MY_JWT_KEY} = process.env;
        if(!MY_JWT_KEY){
            return res.status(500).json({ error : 'ENV  JWT key not informed'});
        }
    
        if(!req || !req.headers){
            return res.status(401).json({error: 'Token validation failed'});
        }
        
        if(req.method !== 'OPTIONS'){
            const authorization = req.headers['authorization'];
            if(!authorization){
                return res.status(401).json({error: 'Token validation failed'});
            }
    
            const token = authorization.substring(7);
            if(!token){
                return res.status(401).json({error: 'Token validation failed'});
            }
    
            const decoded = jwt.verify(token, MY_JWT_KEY) as JwtPayload;
            if(!decoded){
                return res.status(401).json({error: 'Token validation failed'});
            }
    
            if(!req.query){
                req.query = {};
            }
    
            req.query.userId = decoded._id;
        }
    }catch(e){
        console.log(e);
        return res.status(401).json({error: 'Token validation failed'});    
    }

    return handler(req, res);
}
