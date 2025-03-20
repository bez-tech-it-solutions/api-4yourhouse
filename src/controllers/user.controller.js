import Admin from '../models/admin.model.js';
import Users from '../models/user.model.js';
import axios from 'axios';

import { handleValidation } from '../common/utils/handleValidation.js';
import { uploadFileOnCloud, deleteFileFromCloud } from '../common/utils/uploadFile.js';


// ========== Get User Profile ==========
export const getCurrentUser = async (request, response) => {
	try {
		const profile = await Users.findById(request?.user._id).populate(["recentlyViewed", "wishlist"]);
		response.status(200).json({ status: 200, profile });
	} catch (error) {
		console.log(error);
		response.status(500).json({ status: 500, message: error.message });
	}
};


// ========== Get Admin Profile ==========
export const getAdmin = async (request, response) => {
	try {
		const profile = await Admin.findById(request?.admin._id);
		response.status(200).json({ status: 200, profile });
	} catch (error) {
		console.log(error);
		response.status(500).json({ status: 500, message: error.message });
	}
};


// ========== Update Admin Profile ==========
export const updateAdmin = async (request, response) => {
	try {
		const profile = await Admin.findByIdAndUpdate(request?.admin._id, { username: request.body?.username });
		response.status(200).json({ status: 200, profile });
	} catch (error) {
		console.log(error);
		response.status(500).json({ status: 500, message: error.message });
	}
};


// ========== Update User Profile ==========
export const updateCurrentUser = async (request, response) => {
	try {
		const { user, files, body } = request;

		if (files?.picture[0]) {
			if (user?.pictureID) {
				const pictureID = user.pictureID.split('/').pop();
				await deleteFileFromCloud(pictureID);
			}

			const uploadedImg = await uploadFileOnCloud(files.picture[0].path, files.picture[0].filename);
			const { data } = await axios.get(`http://localhost:5000/v1/source/${uploadedImg?.id}`);
			body['pictureID'] = `${uploadedImg?.id}`;
			body['picture'] = `${data.url}`;
		}

		const updatedUser = await Users.findByIdAndUpdate(user._id, body, { new: true });
		response.status(200).json({ status: 200, profile: updatedUser });
	} catch (error) {
		if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
			response.status(422).json({ status: 422, message: handleValidation(error, "Users") });
		} else {
			console.log(error);
			response.status(500).json({ status: 500, message: error.message });
		}
	}
};


// ========== Update User Profile ==========
export const updateCurrentUserPassword = async (request, response) => {
	try {
		const { user, body } = request;

		if (!body.oldPassword) return response.status(404).json({ status: 404, message: "Old password is missing" });
		if (!body.newPassword) return response.status(404).json({ status: 404, message: "New password is missing" });

		const updated = await Users.findById(user._id);
		if (!(await updated.matchPassword(body.oldPassword))) return response.status(400).json({ status: 400, message: "Incorrect old password" });

		await Users.findByIdAndUpdate(user._id, { password: body.newPassword, passwordChangedAt: Date.now() }, { new: true, runValidators: true });
		response.status(200).json({ status: 200, message: "Password changed successfully" });
	} catch (error) {
		console.log(error);
		response.status(500).json({ status: 500, message: error.message });
	}
};


// ========== Update Recently Viewed Properties ==========
export const handleSearchHistory = async (request, response) => {
	try {
		const { user, body } = request;
		const { searchKeywords, action } = body;

		const check = await Users.findById(user._id);
		if (!check) return response.status(404).json({ status: 404, message: "User not found" });

		const update = action === "add"
			? { $addToSet: { searchHistory: searchKeywords } }
			: action === "remove"
			? { $pull: { searchHistory: searchKeywords } }
			: null;

		if (!update) return response.status(400).json({ status: 400, message: "Invalid action" });

		const updatedUser = await Users.findByIdAndUpdate(user._id, update, { new: true }).populate({
			path: "recentlyViewed",
			model: "Properties",
			foreignField: "listingKey",
			localField: "recentlyViewed",
		}).populate({
			path: "wishlist",
			model: "Properties",
			foreignField: "listingKey",
			localField: "wishlist",
		});

		response.status(200).json({ status: 200, profile: updatedUser });
	} catch (error) {
		console.error("Error updating recently viewed properties:", error);
		response.status(500).json({ status: 500, message: "Internal server error" });
	}
};


// ========== Update Recently Viewed Properties ==========
export const recentlyViewedProperties = async (request, response) => {
	try {
		const { user, body } = request;
		const { listingKey, action } = body;

		if (!listingKey) return response.status(400).json({ status: 400, message: "Property ID is required" });

		const check = await Users.findById(user._id);
		if (!check) return response.status(404).json({ status: 404, message: "User not found" });

		const update = action === "add"
			? { $addToSet: { recentlyViewed: listingKey } }
			: action === "remove"
			? { $pull: { recentlyViewed: listingKey } }
			: null;

		if (!update) return response.status(400).json({ status: 400, message: "Invalid action" });

		const updatedUser = await Users.findByIdAndUpdate(user._id, update, { new: true }).populate({
			path: "recentlyViewed",
			model: "Properties",
			foreignField: "listingKey",
			localField: "recentlyViewed",
		}).populate({
			path: "wishlist",
			model: "Properties",
			foreignField: "listingKey",
			localField: "wishlist",
		});

		response.status(200).json({ status: 200, profile: updatedUser });
	} catch (error) {
		console.error("Error updating recently viewed properties:", error);
		response.status(500).json({ status: 500, message: "Internal server error" });
	}
};


// ========== Add or Remove Property from User's Wishlist ==========
export const currentUserWishlist = async (request, response) => {
	try {
		const { user, body } = request;
		const { listingKey } = body;

		if (!listingKey) return response.status(400).json({ status: 400, message: "Property ID is required" });

		const check = await Users.findById(user._id);
		if (!check) return response.status(404).json({ status: 404, message: "User not found" });

		const update = check.wishlist.includes(listingKey)
			? { $pull: { wishlist: listingKey } }
			: { $addToSet: { wishlist: listingKey } };

		const updatedUser = await Users.findByIdAndUpdate(user._id, update, { new: true }).populate({
			path: "recentlyViewed",
			model: "Properties",
			foreignField: "listingKey",
			localField: "recentlyViewed",
		}).populate({
			path: "wishlist",
			model: "Properties",
			foreignField: "listingKey",
			localField: "wishlist",
		});

		response.status(200).json({ status: 200, profile: updatedUser });
	} catch (error) {
		console.error("Error updating wishlist:", error);
		response.status(500).json({ status: 500, message: "Internal server error" });
	}
};