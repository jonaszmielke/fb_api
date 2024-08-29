import { error } from 'console';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';


function generateRandomString(length:number) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function CreateUpload(destination:string){

    const allowed_options = ['posts', 'profile_pictures'];
    if(!allowed_options.includes(destination))
        throw new Error('Provided destionation is not allowed')

    const storage = multer.diskStorage({
        destination: `app_images/${destination}`,
        filename: (req, file, cb) => {
            cb(null, generateRandomString(12) + path.extname(file.originalname))
        }

    })

    const upload = multer({
        storage: storage,
        limits: {filesize: 16000000},
        fileFilter: (req, file, cb) => {
    
            const filetypes = /jpeg|jpg|png|gif/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);
    
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb('Error: Images Only!');
            }
        }
    });

    return upload;

}

export default CreateUpload;