import { NextFunction, Request, Response } from 'express';
import Product from '../models/Product';
import Transaction, { TransactionStatus } from '../models/Transaction';

const createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { product_id, quantity } = req.body as { product_id?: string; quantity?: number };

    if (!product_id || !quantity) {
      return res.status(400).json({ message: 'product_id and quantity are required' });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const transaction = await Transaction.create({ product_id, quantity, status: 'pending' });
    return res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const transactions = await Transaction.find()
      .populate('product_id', 'name price quantity')
      .sort({ createdAt: -1 });

    return res.json(transactions);
  } catch (error) {
    next(error);
  }
};

const updateTransactionStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { status } = req.body as { status?: TransactionStatus };

    if (!status || !['pending', 'confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const previousStatus = transaction.status;

    if (previousStatus !== 'confirmed' && status === 'confirmed') {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: transaction.product_id, quantity: { $gte: transaction.quantity } },
        { $inc: { quantity: -transaction.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(400).json({ message: 'Insufficient stock to confirm transaction' });
      }
    }

    transaction.status = status;
    await transaction.save();

    return res.json(transaction);
  } catch (error) {
    next(error);
  }
};

export { createTransaction, getTransactions, updateTransactionStatus };