import mongoose from 'mongoose'
import validator from 'validator'

const { Schema, model, models } = mongoose;
const { isEmail } = validator;

const consultationSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            validate: [isEmail, "Email should be valid"],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            validate: {
                validator: function (value) {
                    return !value || /^(\+1)?[ -]?(\d{3})[ -]?(\d{3})[ -]?(\d{4})$/.test(value);
                },
                message: "Phone number should be a valid Canadian number."
            },
        },
        message: {
            type: String,
            required: [true, "Message is required"]
        },
    },
    { timestamps: true }
);

const consultationModel = models.Consultation || model("Consultation", consultationSchema);
export default consultationModel;