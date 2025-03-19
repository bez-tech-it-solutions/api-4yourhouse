import { Router } from 'express';
import { contactMessage, getUsers, getSingleUser, getContacts, newsletter, getNewsletter, consultation, getConsultation, getImageSource } from '../controllers/general.controller.js';

const router = Router();

router.post('/contact', contactMessage);
router.post('/newsletter', newsletter);
router.post('/consultation', consultation);

router.get('/users', getUsers);
router.get('/users/:id', getSingleUser);
router.get('/contact', getContacts);
router.get('/newsletter', getNewsletter);
router.get('/consultation', getConsultation);

router.get('/source/:imageID', getImageSource);

export default router;