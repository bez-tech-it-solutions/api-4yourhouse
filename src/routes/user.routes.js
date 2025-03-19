import { Router } from 'express';
import { getCurrentUser, updateCurrentUser, updateCurrentUserPassword, recentlyViewedProperties, currentUserWishlist } from '../controllers/user.controller.js';
import { uploadFile } from '../common/middlewares/uploadFile.js';
import { authGuard } from '../common/guards/auth.guard.js';

const router = Router();

const fields = [{ name: "picture", maxCount: 1 }];

router.get('/user/me', authGuard, getCurrentUser);
router.patch('/user/me', authGuard, uploadFile(fields), updateCurrentUser);
router.patch('/user/update-password', authGuard, updateCurrentUserPassword);
router.patch('/user/recently-viewed', authGuard, recentlyViewedProperties);
router.patch('/user/wishlist', authGuard, currentUserWishlist);

export default router;