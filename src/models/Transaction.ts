import mongoose, { Document } from 'mongoose';

export type TransactionStatus = 'pending' | 'confirmed' | 'rejected';

export interface ITransaction extends Document {
  product_id: mongoose.Types.ObjectId;
  quantity: number;
  date: Date;
  status: TransactionStatus;
}

const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;