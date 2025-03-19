import multer from 'multer';

export const uploadFile = (fields) => {
    const storage = multer.diskStorage({
        destination: "storage",
        filename: (request, file, callback) => {
            callback(null, Date.now() + "_" + file.originalname);
        },
    });

    const upload = multer({ storage }).fields(fields);
    return upload;
};