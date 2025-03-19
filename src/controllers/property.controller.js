import Properties from '../models/property.model.js';
import env from '../common/constants/env.constants.js';
import { checkMongoID } from '../common/utils/checkMongoID.js';
import { sendMail } from '../common/utils/sendMail.js';


// ========== Fetch properties from Database ==========
export const getProperties = async (request, response) => {
	try {
		let {
			search,
			limit = 100, // Maximum number of records to fetch
			recordPerPage = 12, // Number of records per page
			page = 1,
			sort = "createdAt",
			order = "desc",
			minPrice,
			maxPrice,
			BedroomsTotal,
			BathroomsTotalInteger,
			excludeListingKey,
			...filters
		} = request.query;

		const query = {};

		// Text Search Filter
		if (search && typeof search === "string" && search.trim().length > 0) {
			query["$or"] = [
				{ "json.UnparsedAddress": { $regex: search, $options: "i" } },
				{ "json.ListingKey": { $regex: search, $options: "i" } }
			];
		}

		if (excludeListingKey) {
			query["json.ListingKey"] = { $ne: excludeListingKey };
		}

		// Price Range Filter
		if (minPrice || maxPrice) {
			query["json.ListPrice"] = {};
			if (minPrice) query["json.ListPrice"].$gte = parseInt(minPrice, 10);
			if (maxPrice) query["json.ListPrice"].$lte = parseInt(maxPrice, 10);
		}

		// Bedrooms & Bathrooms Filters
		if (BedroomsTotal) {
			query["json.BedroomsTotal"] = BedroomsTotal === "4+" ? { $gte: 4 } : parseInt(BedroomsTotal, 10);
		}
		if (BathroomsTotalInteger) {
			query["json.BathroomsTotalInteger"] = BathroomsTotalInteger === "4+" ? { $gte: 4 } : parseInt(BathroomsTotalInteger, 10);
		}

		// Dynamic Filters
		Object.keys(filters).forEach((key) => {
			query[`json.${key}`] = filters[key];
		});

		// Ensure numeric values are valid
		limit = Math.max(1, parseInt(limit, 10));
		recordPerPage = Math.max(1, parseInt(recordPerPage, 10));
		page = Math.max(1, parseInt(page, 10));

		// Fetch up to "limit" records only
		const totalRecords = await Properties.countDocuments(query);
		const maxRecords = Math.min(totalRecords, limit);

		// Calculate pagination within the "limit"
		const totalPages = Math.ceil(maxRecords / recordPerPage);
		const skip = (page - 1) * recordPerPage;

		// Ensure we don’t exceed the "limit"
		const properties = await Properties.find(query)
			.sort({ [sort]: order === "asc" ? 1 : -1 })
			.skip(skip)
			.limit(Math.min(recordPerPage, limit - skip)) // Ensure we don't exceed the limit
			.select("-__v") // Exclude unnecessary fields
			.lean();

		response.status(200).json({
			status: 200,
			data: properties,
			pagination: {
				totalRecords: maxRecords,
				recordPerPage,
				currentPage: page,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Error fetching properties:", error);
		response.status(500).json({ status: 500, message: "Internal server error" });
	}
};


// ========== Get Single Property ==========
export const getSingleProperty = async (request, response) => {
	try {
		const { id } = request.params;

		if (!checkMongoID(id)) return response.status(400).json({ status: 400, message: "Invalid MongoDB ObjectID" });

		const property = await Properties.findById(id).select("-__v").lean();
		if (!property) return response.status(404).json({ status: 404, message: "Property not found" });

		response.status(200).json({ status: 200, property });
	} catch (error) {
		console.error("Single Property Fetching Error:", error);
		response.status(500).json({ status: 500, message: "Internal server error" });
	}
};