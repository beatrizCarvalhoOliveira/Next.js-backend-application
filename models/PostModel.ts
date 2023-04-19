import mongoose, {Schema} from 'mongoose';

const PostSchema = new Schema({
    idUser : {type : String, required : true},
    caption : {type : String, required : true},
    picture : {type : String, required : true},
    postDate : {type : Date, required : true},
    comment : { type : Array, required : true, default : []},
    likes : { type : Array, required : true, default : []},
});

export const PostModel = (mongoose.models.posts ||
    mongoose.model('posts', PostSchema));