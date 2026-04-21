import express from 'express';
import {
  loginAdmin,
  registerAdmin,
  requestPasswordResetCode,
  resetPasswordWithCode,
  verifyPasswordResetCode
} from '../controllers/authController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register an admin user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       409:
 *         description: Username already exists
 */
router.post('/register', registerAdmin);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login admin and receive JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginAdmin);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Generate and email a 6-digit password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Generic response for account-enumeration safety
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If an account exists, a verification code has been sent
 *       400:
 *         description: Email is required
 */
router.post('/forgot-password', requestPasswordResetCode);

/**
 * @swagger
 * /api/auth/verify-reset-code:
 *   post:
 *     summary: Verify a 6-digit password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Code verified successfully
 *       400:
 *         description: Missing fields, invalid format, invalid code, or expired code
 *       429:
 *         description: Too many failed attempts, request a new code
 */
router.post('/verify-reset-code', verifyPasswordResetCode);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password after successful code verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Missing input, no active request, or expired reset code
 *       403:
 *         description: Reset code verification is required first
 */
router.post('/reset-password', resetPasswordWithCode);

export default router;
