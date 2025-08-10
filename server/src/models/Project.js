import { getDB } from '../database/db.js';

export class Project {
  static async create({ userId, name, type = 'vertical', volume = 0, configuration }) {
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
    
    // Build dynamic update query based on provided fields
    const updateFields = [];
    const updateValues = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    
    if (type !== undefined) {
      updateFields.push('type = ?');
      updateValues.push(type);
    }
    
    if (volume !== undefined) {
      updateFields.push('volume = ?');
      updateValues.push(volume);
    }
    
    if (configuration !== undefined) {
      updateFields.push('configuration = ?');
      updateValues.push(JSON.stringify(configuration));
    }
    
    // Always update the timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add WHERE clause parameters
    updateValues.push(projectId, userId);
    
    const query = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
    
    const result = await db.run(query, updateValues);
    
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