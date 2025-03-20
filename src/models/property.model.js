import mongoose from 'mongoose'

const { Schema, model, models } = mongoose;

const propertySchema = new Schema(
    {
        listingKey: {
            type: String,
            unique: true
        },
        json: {
            type: Object
        },
    },
    { timestamps: true }
);

const propertyModel = models.Properties || model("Properties", propertySchema);
export default propertyModel;