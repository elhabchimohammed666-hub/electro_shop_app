import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function setSessionCookie(res, userId) {
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

export async function register(req, res) {
  const user = await User.create(req.body);
  setSessionCookie(res, user.id);
  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.verifyPassword(req.body.password))) {
    return res.status(401).json({ message: 'E-mail ou mot de passe incorrect.' });
  }
  setSessionCookie(res, user.id);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

export function logout(req, res) {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.json({ message: 'Vous êtes déconnecté.' });
}

export function currentUser(req, res) {
  res.json({ user: req.user });
}
