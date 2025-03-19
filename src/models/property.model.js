import mongoose from 'mongoose'

const { Schema, model, models } = mongoose;

const propertySchema = new Schema(
    {
        json: {
            type: Object
        },
    },
    { timestamps: true }
);

const propertyModel = models.Properties || model("Properties", propertySchema);
export default propertyModel;