import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from './asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: 'Veuillez vous connecter.' });

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.sub).select('_id name email role');
  if (!user) return res.status(401).json({ message: 'Session invalide.' });
  req.user = user;
  next();
});

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès réservé.' });
    }
    next();
  };
}
