import { getDB } from '../database/db.js';

export class Project {
  static async create({ userId, name, type, volume, configuration }) {
    const db = await getDB();
    const result = await db.run(
      'INSERT INTO projects (user_id, name, type, volume, configuration) VALUES (?, ?, ?, ?, ?)',
      [userId, name, type, volume, JSON.stringify(configuration)]
    );
    
    // Get the created project
    const project = await db.get(
      'SELECT * FROM projects WHERE id = ?',
      [result.lastID]
    );
    
    return project;
  }

  static async findByUserId(userId) {
    const db = await getDB();
    const projects = await db.all(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    
    return projects;
  }

  static async findById(projectId, userId) {
    const db = await getDB();
    const project = await db.get(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );
    
    return project;
  }

  static async update(projectId, userId, updates) {
    const { name, type, volume, configuration } = updates;
    const db = await getDB();
    
    const result = await db.run(
      'UPDATE projects SET name = ?, type = ?, volume = ?, configuration = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [name, type, volume, JSON.stringify(configuration), projectId, userId]
    );
    
    if (result.changes === 0) {
      return null;
    }
    
    // Get the updated project
    const project = await db.get(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );
    
    return project;
  }

  static async delete(projectId, userId) {
    const db = await getDB();
    
    // Get project before deleting
    const project = await db.get(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );
    
    if (!project) {
      return null;
    }
    
    await db.run(
      'DELETE FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );
    
    return project;
  }

  static async duplicate(projectId, userId, newName) {
    const db = await getDB();
    const original = await this.findById(projectId, userId);
    if (!original) return null;

    const result = await db.run(
      'INSERT INTO projects (user_id, name, type, volume, configuration) VALUES (?, ?, ?, ?, ?)',
      [userId, newName, original.type, original.volume, original.configuration]
    );
    
    // Get the duplicated project
    const project = await db.get(
      'SELECT * FROM projects WHERE id = ?',
      [result.lastID]
    );
    
    return project;
  }
}