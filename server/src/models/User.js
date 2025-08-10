import { getDB } from '../database/db.js';
import bcrypt from 'bcryptjs';

export class User {
  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const db = await getDB();
    
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    // Get the created user
    const user = await db.get(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [result.lastID]
    );
    
    return user;
  }

  static async findByEmail(email) {
    const db = await getDB();
    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    return user;
  }

  static async findById(id) {
    const db = await getDB();
    const user = await db.get(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    
    return user;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(userId) {
    const db = await getDB();
    await db.run(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  }
}