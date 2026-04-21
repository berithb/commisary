import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import sendEmail from '../utils/email';
import buildResetPasswordEmail from '../utils/templates/resetPasswordEmailTemplate';

const RESET_CODE_TTL_MS = 10 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

const hashResetCode = (code: string): string => crypto.createHash('sha256').update(code).digest('hex');

const generateSixDigitCode = (): string => crypto.randomInt(100000, 1000000).toString();

const registerAdmin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const user = await User.create({ username, password });

    return res.status(201).json({
      message: 'Admin registered successfully',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginAdmin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role
    });

    return res.json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    next(error);
  }
};

const requestPasswordResetCode = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedEmail }]
    });

    if (user) {
      const resetCode = generateSixDigitCode();

      user.resetCodeHash = hashResetCode(resetCode);
      user.resetExpires = new Date(Date.now() + RESET_CODE_TTL_MS);
      user.resetFailedAttempts = 0;
      user.resetCodeVerified = false;
      await user.save();

      const userName = user.username || user.email || 'User';
      const { html, text } = buildResetPasswordEmail({ userName, resetCode });

      await sendEmail({
        to: user.email || normalizedEmail,
        subject: 'Your Commissary System password reset code',
        text,
        html
      });
    }

    return res.json({ message: 'If an account exists, a verification code has been sent' });
  } catch (error) {
    next(error);
  }
};

const verifyPasswordResetCode = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email, code } = req.body as { email?: string; code?: string };

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Code must be a 6-digit numeric value' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedEmail }]
    });

    if (!user || !user.resetCodeHash || !user.resetExpires) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    if (user.resetExpires.getTime() <= Date.now()) {
      user.resetCodeHash = undefined;
      user.resetExpires = undefined;
      user.resetFailedAttempts = 0;
      user.resetCodeVerified = false;
      await user.save();

      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    if (user.resetFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      user.resetCodeHash = undefined;
      user.resetExpires = undefined;
      user.resetFailedAttempts = 0;
      user.resetCodeVerified = false;
      await user.save();

      return res.status(429).json({ message: 'Too many failed attempts. Request a new code.' });
    }

    const hashedInputCode = hashResetCode(code);
    if (hashedInputCode !== user.resetCodeHash) {
      user.resetFailedAttempts += 1;

      if (user.resetFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        user.resetCodeHash = undefined;
        user.resetExpires = undefined;
        user.resetFailedAttempts = 0;
        user.resetCodeVerified = false;
      }

      await user.save();
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.resetCodeVerified = true;
    user.resetFailedAttempts = 0;
    await user.save();

    return res.json({ message: 'Code verified successfully' });
  } catch (error) {
    next(error);
  }
};

const resetPasswordWithCode = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email, newPassword } = req.body as { email?: string; newPassword?: string };

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and newPassword are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'newPassword must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedEmail }]
    });

    if (!user || !user.resetCodeHash || !user.resetExpires) {
      return res.status(400).json({ message: 'No active password reset request found' });
    }

    if (user.resetExpires.getTime() <= Date.now()) {
      user.resetCodeHash = undefined;
      user.resetExpires = undefined;
      user.resetFailedAttempts = 0;
      user.resetCodeVerified = false;
      await user.save();

      return res.status(400).json({ message: 'Reset code has expired. Request a new code.' });
    }

    if (!user.resetCodeVerified) {
      return res.status(403).json({ message: 'Verification required before resetting password' });
    }

    user.password = newPassword;
    user.resetCodeHash = undefined;
    user.resetExpires = undefined;
    user.resetFailedAttempts = 0;
    user.resetCodeVerified = false;
    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

export {
  registerAdmin,
  loginAdmin,
  requestPasswordResetCode,
  verifyPasswordResetCode,
  resetPasswordWithCode
};
