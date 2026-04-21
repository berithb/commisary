import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';

const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { name, price, quantity } = req.body as {
      name?: string;
      price?: number;
      quantity?: number;
    };

    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Name, price, and quantity are required' });
    }

    const product = await Product.create({ name, price, quantity });
    return res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const getProducts = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export { createProduct, getProducts, updateProduct, deleteProduct };
