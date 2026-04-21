import express from 'express';
import {
  createTransaction,
  getTransactions,
  updateTransactionStatus
} from '../controllers/transactionController';
import adminOnly from '../middleware/adminMiddleware';
import protect from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - product_id
 *         - quantity
 *       properties:
 *         _id:
 *           type: string
 *         product_id:
 *           type: string
 *         quantity:
 *           type: integer
 *           minimum: 1
 *         date:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, confirmed, rejected]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction creation and admin processing
 */

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a transaction (public)
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Transaction created with pending status
 *       404:
 *         description: Product not found
 */
router.post('/', createTransaction);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions (admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, adminOnly, getTransactions);

/**
 * @swagger
 * /api/transactions/{id}/status:
 *   patch:
 *     summary: Update transaction status (admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, rejected]
 *     responses:
 *       200:
 *         description: Transaction status updated
 *       400:
 *         description: Invalid status or insufficient stock
 *       404:
 *         description: Transaction not found
 */
router.patch('/:id/status', protect, adminOnly, updateTransactionStatus);

export default router;