import multer from "multer";
import cosmicjs from "cosmicjs";

const {
    AVATAR_KEY,
    POSTS_KEY,
    AVATAR_BUCKET,
    POSTS_BUCKET } = process.env;

const Cosmic = cosmicjs();
const avatarBucket = Cosmic.bucket({
    slug: AVATAR_BUCKET,
    write_key: AVATAR_KEY
});

const postsBucket = Cosmic.bucket({
    slug:  POSTS_BUCKET,
    write_key:POSTS_KEY
});

//return StorageEngine configured to store files in memory as buffer objects
const storage = multer.memoryStorage();
//set the specific storage to store the files 
const updload = multer({storage : storage});

const uploadImageCosmic = async(req : any) => {
    if(req?.file?.originalname){

        if(!req.file.originalname.includes('.png') &&
            !req.file.originalname.includes('.jpg') && 
            !req.file.originalname.includes('.jpeg')){
                throw new Error('Extensao da imagem invalida');
        } 

        const media_object = {
            originalname: req.file.originalname,
            buffer : req.file.buffer
        };

        if(req.url && req.url.includes('post')){
            return await postsBucket.addMedia({media : media_object});
        }else{
            return await avatarBucket.addMedia({media : media_object});
        }
    }
}

export {updload, uploadImageCosmic};