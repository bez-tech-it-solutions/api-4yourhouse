import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const { Schema, model, models } = mongoose;
const { isEmail, isStrongPassword } = validator;

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, "Name is required"],
            minlength: [3, "Name should be at least 3 characters long"],
            validate: {
                validator: function (value) {
                    return /^[a-zA-Z\s]+$/.test(value);
                },
                message: "Name should only contain letters and spaces."
            }
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            validate: [isEmail, "Email should be valid"],
            unique: true,
            sparse: true,
        },
        phone: {
            type: String,
            // required: [true, "Phone number is required"],
            validate: {
                validator: function (value) {
                    return !value || /^(\+1)?[ -]?(\d{3})[ -]?(\d{3})[ -]?(\d{4})$/.test(value);
                },
                message: "Phone number should be a valid Canadian number."
            },
            unique: true,
            sparse: true
        },
        picture: {
            type: String,
            default: null
        },
        recentlyViewed: [{
            type: Schema.Types.ObjectId,
            ref: "Properties"
        }],
        wishlist: [{
            type: Schema.Types.ObjectId,
            ref: "Properties"
        }],
        password: {
            type: String,
            required: [function () {
                return this.method === "manual";
            }, "Password is required"],
            validate: {
                validator: function (value) {
                    return this.method !== "manual" || isStrongPassword(value);
                },
                message: "Password is too weak"
            }
        },
        method: {
            type: String,
            enum: ["manual", "google", "facebook", "apple"],
            required: [true, "Method is required. e.g google, facebook, apple, manual"]
        },
        role: {
            type: String,
            enum: ["@user", "@admin"],
            default: "@user"
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        googleID: {
            type: String,
            unique: true,
            sparse: true,
            required: [function () {
                return this.method === "google";
            }, "Google ID is required"],
        },
        facebookID: {
            type: String,
            unique: true,
            sparse: true,
            required: [function () {
                return this.method === "facebook";
            }, "Facebook ID is required"],
        },
        appleID: {
            type: String,
            unique: true,
            sparse: true,
            required: [function () {
                return this.method === "apple";
            }, "Apple ID is required"],
        },
        otp: String,
        otpExpiry: Date,
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
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update?.password) {
        const salt = await bcrypt.genSalt(12);
        update.password = await bcrypt.hash(update.password, salt);
    }
    next();
});

// Compare password method
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password || "", this.password);
};

// Generate Secure OTP
userSchema.methods.generateOTP = async function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    this.otp = crypto.createHash("sha256").update(otp).digest("hex"); // Hash OTP for security
    this.otpExpiry = Date.now() + 2 * 60 * 1000; // 10 min expiry
    await this.save();
    return otp; // Send plain OTP for user input
};

// Verify OTP
userSchema.methods.verifyOTP = function (enteredOTP) {
    const hashedOTP = crypto.createHash("sha256").update(enteredOTP).digest("hex");
    return this.otp === hashedOTP && this.otpExpiry > Date.now();
};

// Generate Reset Password Token
userSchema.methods.generateResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest("hex");
    this.passwordResetExpiry = Date.now() + 60 * 1000;
    return resetToken;
}

const userModel = models.Users || model("Users", userSchema);
export default userModel;