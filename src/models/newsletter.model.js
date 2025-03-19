import mongoose from 'mongoose'
import validator from 'validator'

const { Schema, model, models } = mongoose;
const { isEmail } = validator;

const newsletterSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            validate: [isEmail, "Email should be valid"],
            unique: true,
        },
    },
    { timestamps: true }
);

const newsletterModel = models.Newsletter || model("Newsletter", newsletterSchema);
export default newsletterModel;