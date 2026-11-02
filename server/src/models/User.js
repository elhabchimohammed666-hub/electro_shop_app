import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true, maxlength: 40 },
  recipient: { type: String, required: true, trim: true },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  postalCode: { type: String, trim: true },
  country: { type: String, required: true, trim: true },
  phone: { type: String, trim: true }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  addresses: [addressSchema]
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
