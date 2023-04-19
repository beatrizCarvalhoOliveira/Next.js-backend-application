import type { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoDB } from '@/middlewares/ConnectMongoDB';
import { corsPolicy } from '@/middlewares/CorsPolicy';
import { tokenJWTValidation } from '@/middlewares/TokenJWTValidation';
import { FollowerModel } from '@/models/FollowerModel';
import { UserModel } from '@/models/UserModel';
import type { StandardResponseMsg } from '@/types/StandardResponseMsg';

const searchEndpoint
    = async (req: NextApiRequest, res: NextApiResponse<StandardResponseMsg | any[]>) => {
        try {
            if (req.method === 'GET') {
                if (req?.query?.id) {
                    const userFound= await UserModel.findById(req?.query?.id);
                    if (!userFound) {
                        return res.status(400).json({ error: 'User not found' });
                    }

                    const user = {
                        password: null,
                        followThisUser: false,
                        name: userFound.nome,
                        email: userFound.email,
                        _id: userFound._id,
                        avatar: userFound.avatar,
                        followers: userFound.followers,
                        following: userFound.following,
                        publicacoes: userFound.posts,
                    } as any;

                    const followThisUser = await FollowerModel.find({ userId: req?.query?.userId, userFollowedId: userFound._id });
                    if (followThisUser && followThisUser.length > 0) {
                        user.followThisUser = true;
                    }
                    return res.status(200).json(user);
                } else {
                    const { filter } = req.query;
                    if (!filter || filter.length < 2) {
                        return res.status(400).json({ error: 'Please type at least  2 characters to complete search' });
                    }

                    const usersFound = await UserModel.find({
                        $or: [{ name: { $regex: filter, $options: 'i' } },
                            //{ email : {$regex : filtro, $options: 'i'}}
                        ]
                    });

                    usersFound.forEach(userFound => {
                        userFound.password = null
                    });

                    return res.status(200).json(usersFound);
                }
            }
            return res.status(405).json({ error: 'Invalid method' });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: 'Search failed:' + e });
        }
    }

export default corsPolicy(tokenJWTValidation(connectMongoDB(searchEndpoint)));