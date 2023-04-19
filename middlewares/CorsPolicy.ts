import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import type {StandardResponseMsg} from "../types/StandardResponseMsg";
import NextCors from 'nextjs-cors';

export const corsPolicy = (handler : NextApiHandler) =>
    async (req : NextApiRequest, res : NextApiResponse<StandardResponseMsg>) => {
    try{
        await NextCors(req, res, {
            origin : '*',
            methods : ['GET', 'POST', 'PUT'],
            optionsSuccessStatus : 200, 
        });

        return handler(req, res);
    }catch(e){
        console.log('Cors policy error:', e);
        return res.status(500).json({error: 'Error validating cors policy'});
    }
}