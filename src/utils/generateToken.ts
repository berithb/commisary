import jwt from 'jsonwebtoken';

type TokenPayload = {
  id: string;
  username: string;
  role: 'admin';
};

const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1d' });
};

export default generateToken;