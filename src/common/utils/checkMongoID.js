import mongoose from 'mongoose';

export const checkMongoID = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    return true;
}