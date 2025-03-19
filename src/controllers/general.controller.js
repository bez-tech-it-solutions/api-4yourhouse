import Users from '../models/user.model.js';
import Contact from '../models/contact.model.js';
import Newsletter from '../models/newsletter.model.js';
import Consultation from '../models/consultation.model.js';
import env from '../common/constants/env.constants.js';

import { handleValidation } from '../common/utils/handleValidation.js';
import { sendMail } from '../common/utils/sendMail.js';
import { getFileFromCloud } from '../common/utils/uploadFile.js';


export const contactMessage = async (request, response) => {
    try {
        const data = await Contact.create({ ...request.body, subject: "Contact Mail" });

        if (data) {
            await sendMail({
                from: env.MAILING_USERNAME,
                to: env.MAILING_USERNAME,
                subject: data.subject,
                html: `Sender Name: ${data.name} <br/> Sender Email: <a href='mailto:${data.email}'>${data.email}</a> <br/> Message: ${data.message}`
            });
        }

        response.status(200).json({ status: 200, message: "Your message successfully sent" });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
            response.status(422).json({ status: 422, errors: handleValidation(error, "Contact") });
        } else {
            console.log(error);
            response.status(500).json({ status: 500, message: "Failed to send message" });
        }
    }
}


export const getContacts = async (request, response) => {
    try {
        const contacts = await Contact.find();
        response.status(200).json({ status: 200, contacts });
    } catch (error) {
        console.log(error);
        response.status(500).json({ status: 500, message: "Failed to fetch contacts" });
    }
}


export const getUsers = async (request, response) => {
    try {
        const users = await Users.find().select('-__v -password');
        response.status(200).json({ status: 200, users });
    } catch (error) {
        console.log(error);
        response.status(500).json({ status: 500, message: "Failed to fetch users" });
    }
}


export const getSingleUser = async (request, response) => {
    try {
        const user = await Users.findById(request.params.id).populate(["recentlyViewed", "wishlist"]).select('-__v -password');
        response.status(200).json({ status: 200, user });
    } catch (error) {
        console.log(error);
        response.status(500).json({ status: 500, message: "Failed to fetch users" });
    }
}


export const newsletter = async (request, response) => {
    try {
        const { email } = request.body

        const data = await Newsletter.create({ email });

        if (data) {
            await sendMail({
                from: env.MAILING_USERNAME,
                to: email,
                subject: "Thank You for Subscribing to 4 Your House!",
                html: `Dear Subscriber,
                <br/><br/>
                Welcome to the 4 Your House community! We're thrilled to have you on board.
                <br/><br/>
                By subscribing to our newsletter, you'll receive exclusive real estate insights, market updates, home-buying tips, and expert advice—all designed to help you make informed decisions on your property journey.
                <br/><br/>
                At 4 Your House, we're committed to turning your homeownership dreams into reality. If you have any questions or need personalized assistance, feel free to reach out—we're here to help!
                <br/><br/>
                Stay tuned for exciting updates and valuable content straight to your inbox.
                <br/><br/>
                Thank you for trusting us—we look forward to being part of your journey!
                <br/><br/>
                Best regards,
                <br/>
                The 4 Your House Team
                <br/>
                <a href="https://4yourhouse.ca" target="_blank">4yourhouse.ca</a>
                <br/>
                <a href="mailto:sadiq@4yourhouse.ca">sadiq@4yourhouse.ca</a>`
            });
        }

        response.status(200).json({ status: 200, message: "Your message successfully sent" });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
            response.status(422).json({ status: 422, errors: handleValidation(error, "Newsletter") });
        } else {
            console.log(error);
            response.status(500).json({ status: 500, message: "Failed to send message" });
        }
    }
}


export const getNewsletter = async (request, response) => {
    try {
        const newsletter = await Newsletter.find();
        response.status(200).json({ status: 200, newsletter });
    } catch (error) {
        console.log(error);
        response.status(500).json({ status: 500, message: "Failed to fetch newsletter" });
    }
}


export const consultation = async (request, response) => {
	try {
		const { name, email, phone, message } = request.body;

        const data = await Consultation.create({ name, email, phone, message });

        if (data) {
            await sendMail({
                from: env.MAILING_USERNAME,
                to: email,
                subject: "Consultation Lead",
                html: `Sender Name: ${name} <br/> Sender Email: <a href='mailto:${email}'>${email}</a> <br/> Sender Phone Number: <a href='tel:${phone}'>${phone}</a> <br/> Message: ${message}`
            });
        }

		response.status(200).json({ status: 200, message: "Consultation successfully sent" });
	} catch (error) {
		if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
            response.status(422).json({ status: 422, errors: handleValidation(error, "Consultation") });
        } else {
            console.log(error);
            response.status(500).json({ status: 500, message: "Failed to send message" });
        }
	}
};


export const getConsultation = async (request, response) => {
    try {
        const consultation = await Consultation.find();
        response.status(200).json({ status: 200, consultation });
    } catch (error) {
        console.log(error);
        response.status(500).json({ status: 500, message: "Failed to fetch consultation" });
    }
}


export const getImageSource = async (request, response) => {
    try {
        const getUrl = (await getFileFromCloud(request.params.imageID)).thumbnailLink;
        const readyUrl = getUrl.replace("=s220", "");
        response.status(200).json({ status: 200, url: readyUrl });
    } catch (error) {
        console.log(error);
        response.status(500).json({ error });
    }
}