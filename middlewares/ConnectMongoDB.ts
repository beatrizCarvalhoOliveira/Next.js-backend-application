import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import mongoose from 'mongoose';
import type { StandardResponseMsg } from "@/types/StandardResponseMsg";

export const connectMongoDB = (handler: NextApiHandler) =>
async (req: NextApiRequest, res:NextApiResponse<StandardResponseMsg | any[]>)=>{
    // check if DB is already connected if it is go to endpoint or next middleware 
    if(mongoose.connections[0].readyState){
        return handler(req, res);
    }

    // if not connected , then connect getting env var
    const {DB_CONNECTION_STRING} = process.env;

     // if env var is empty return error
    if(!DB_CONNECTION_STRING){
        return res.status(500).json({ error : 'ENV var not infromed'});
    }

    mongoose.connection.on('connected', () => console.log('DB connected'));
    mongoose.connection.on('error', error => console.log(`Fail to conncet with DB: ${error}`));
    await mongoose.connect(DB_CONNECTION_STRING);

    // with db conncted proceed to endpoint
    return handler(req, res);
}
