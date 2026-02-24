import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// Function untuk hash password
export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}

// Function untuk compare password
export async function comparePassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing password:', error);
    throw error;
  }
}

// Function untuk generate JWT token
export function generateToken(userId, email, username) {
  try {
    const token = jwt.sign(
      {
        id: userId,
        email: email,
        username: username,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
}

// Function untuk verify JWT token
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
