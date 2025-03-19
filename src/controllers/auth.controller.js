import Users from '../models/user.model.js';
import env from '../common/constants/env.constants.js';

import { createHash } from 'crypto';
import { handleValidation } from '../common/utils/handleValidation.js';
import { generateToken } from '../common/utils/jwt.js';
import { sendMail } from '../common/utils/sendMail.js';


// ========== Handle Social SignIn ==========
export const social = async (request, response) => {
	try {
		const { email, method, socialID } = request.body;
		var user = await Users.findOne({ email, method, [`${method}ID`]: socialID });

		if (user) {
			const accessToken = generateToken({ id: user._id });
			return response.status(200).json({ status: 200, accessToken });
		}

		var user = await Users.findOne({ email, method: { $ne: method } });

		if (user) return response.status(409).json({ status: 409, message: "This email already exists" });

		const newUser = await Users.create({ ...request.body, [`${method}ID`]: socialID, isVerified: true });
		const accessToken = generateToken({ id: newUser._id });

		response.status(201).json({ status: 201, accessToken });
	} catch (error) {
		if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
			response.status(422).json({ status: 422, message: handleValidation(error, "Users") });
		} else {
			console.log(error);
			response.status(500).json({ status: 500, message: "Internal Server Error" });
		}
	}
};


// ========== Handle SignIn ==========
export const signin = async (request, response) => {
	try {
		const { email, phone, password } = request.body;
		const query = [];

		if (email) query.push({ email });
		if (phone) query.push({ phone });

		const user = query.length ? await Users.findOne({ $or: query, method: "manual" }) : null;
		if (!user || !(await user.matchPassword(password))) return response.status(401).json({ status: 401, message: "Incorrect credentials" });

		const accessToken = generateToken({ id: user._id });
		response.status(200).json({ status: 200, accessToken });
	} catch (error) {
		console.log(error);
		response.status(error.status).json({ status: error.status, message: error.message });
	}
};


// ========== Handle SignUp ==========
export const signup = async (request, response) => {
	try {
		const user = await Users.create(request.body);
		const otp = await user.generateOTP();

		const sent = await sendMail({
			from: env.MAILING_USERNAME,
			to: user.email,
			subject: "Account Verification",
			html: `This is your verification code: <strong>${otp}</strong>`
		});

		if (sent) return response.status(201).json({ status: 201, message: "OTP sent" });
	} catch (error) {
		if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
			response.status(422).json({ status: 422, errors: handleValidation(error, "Users") });
		} else {
			console.log(error);
			response.status(500).json({ status: 500, message: "Internal Server Error" });
		}
	}
};


// ========== Verify Email via OTP ==========
export const verifyOTP = async (request, response) => {
	try {
		const { email, otp } = request.body;

		const user = await Users.findOne({ email });
		if (!user) return response.status(404).json({ status: 404, message: "User not found" });

		const isOTPValid = await user.verifyOTP(otp);
		if (!isOTPValid) return response.status(400).json({ status: 400, message: "Invalid or expired OTP" });

		user.otp = undefined;
		user.otpExpiry = undefined;
		user.isVerified = true;
		await user.save(); // Save user updates

		const accessToken = generateToken({ id: user._id });
		response.status(200).json({ status: 200, accessToken });
	} catch (error) {
		response.status(500).json({ status: 500, message: "Internal Server Error" });
	}
};


// ========== Handle Forget Password ==========
export const forgetPassword = async (request, response) => {
	try {
		const { email } = request.body;
		if (!email) return response.status(422).json({ status: 422, message: "Email is required" });

		const user = await Users.findOne({ email });
		if (!user) return response.status(404).json({ status: 404, message: "Sorry. Can't find your account" });

		const resetPasswordToken = await user.generateResetPasswordToken();
		await user.save();

		await sendMail({
			from: env.MAILING_USERNAME,
			to: email,
			subject: "Reset Password",
			html: `Click <a href="http://localhost:5173/auth/reset-password/${resetPasswordToken}" target="_blank">here</a> to reset password`
		});

		response.status(200).json({ status: 200, message: "Link is sent. Please check your email" });
	} catch (error) {
		console.log(error);
		response.status(500).json({ status: 500, message: "Internal Server Error" });
	}
};


// ========== Handle Reset Password ==========
export const resetPassword = async (request, response) => {
	try {
		const { token } = request.params;
		const { password } = request.body;

		if (!token) return response.status(422).json({ status: 422, message: "Token is required" });
		if (!password) return response.status(422).json({ status: 422, message: "Password is required" });

		const hashedToken = createHash("sha256").update(token).digest("hex");
		const user = await Users.findOne({ passwordResetToken: hashedToken, passwordResetExpiry: { $gt: Date.now() } });

		if (!user) return response.status(400).json({ status: 400, message: "Token Expired. Please try again later" });

		user.password = password;
		user.passwordResetToken = undefined;
		user.passwordResetExpiry = undefined;

		await user.save();

		response.status(200).json({ status: 200, message: "Password changed successfully" });
	} catch (error) {
		console.log(error);
		response.status(500).json({ status: 500, message: "Internal Server Error" });
	}
};