import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const { Schema, model, models } = mongoose;
const { isStrongPassword } = validator;

const adminSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            validate: [isStrongPassword, "Password is too weak"]
        },
        accessToken: String,
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpiry: Date,
    },
    {
        timestamps: true
    }
);


// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

adminSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update?.password) {
        const salt = await bcrypt.genSalt(12);
        update.password = await bcrypt.hash(update.password, salt);
    }
    next();
});

// Compare password method
adminSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password || "", this.password);
};

// Generate Reset Password Token
adminSchema.methods.generateResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest("hex");
    this.passwordResetExpiry = Date.now() + 60 * 1000;
    return resetToken;
}

const adminModel = models.Admin || model("Admin", adminSchema);
export default adminModel;