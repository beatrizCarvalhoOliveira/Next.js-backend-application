import mongoose, {Schema} from 'mongoose';

const FollowerSchema = new Schema({
    // Followers
    userId : {type : String, required : true},
    // Following
    userFollowedId : {type : String, required : true}
});

export const FollowerModel = (mongoose.models.followers ||
    mongoose.model('followers', FollowerSchema));