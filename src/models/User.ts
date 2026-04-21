import bcrypt from 'bcryptjs';
import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email?: string;
  password: string;
  role: 'admin';
  resetCodeHash?: string;
  resetExpires?: Date;
  resetFailedAttempts: number;
  resetCodeVerified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      default: 'admin',
      enum: ['admin']
    },
    resetCodeHash: {
      type: String
    },
    resetExpires: {
      type: Date
    },
    resetFailedAttempts: {
      type: Number,
      default: 0
    },
    resetCodeVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
