import { body, validationResult } from 'express-validator';
import { Project } from '../models/Project.js';

export const projectValidation = [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Pavadinimas privalomas (1-255 simboliai)'),
  body('type').isIn(['vertical', 'horizontal', 'spherical']).withMessage('Neteisingas talpos tipas'),
  body('volume').optional().isFloat({ min: 0.1 }).withMessage('Tūris turi būti teigiamas skaičius')
];

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.findByUserId(req.user.id);
    
    // Format projects for frontend
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      type: project.type,
      volume: parseFloat(project.volume) || 0,
      created: project.created_at.toISOString().split('T')[0],
      modified: project.updated_at.toISOString().split('T')[0],
      configuration: project.configuration
    }));

    res.json({ projects: formattedProjects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
};

export const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validacijos klaida', 
        details: errors.array() 
      });
    }

    const { name, type, volume, configuration = {} } = req.body;

    const project = await Project.create({
      userId: req.user.id,
      name,
      type,
      volume,
      configuration
    });

    res.status(201).json({
      message: 'Projektas sukurtas sėkmingai',
      project: {
        id: project.id,
        name: project.name,
        type: project.type,
        volume: parseFloat(project.volume) || 0,
        created: project.created_at.toISOString().split('T')[0],
        modified: project.updated_at.toISOString().split('T')[0],
        configuration: project.configuration
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
};

export const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id, req.user.id);

    if (!project) {
      return res.status(404).json({ error: 'Projektas nerastas' });
    }

    res.json({
      project: {
        id: project.id,
        name: project.name,
        type: project.type,
        volume: parseFloat(project.volume) || 0,
        created: project.created_at.toISOString().split('T')[0],
        modified: project.updated_at.toISOString().split('T')[0],
        configuration: project.configuration
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validacijos klaida', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { name, type, volume, configuration } = req.body;

    const project = await Project.update(id, req.user.id, {
      name,
      type,
      volume,
      configuration
    });

    if (!project) {
      return res.status(404).json({ error: 'Projektas nerastas' });
    }

    res.json({
      message: 'Projektas atnaujintas sėkmingai',
      project: {
        id: project.id,
        name: project.name,
        type: project.type,
        volume: parseFloat(project.volume) || 0,
        created: project.created_at.toISOString().split('T')[0],
        modified: project.updated_at.toISOString().split('T')[0],
        configuration: project.configuration
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.delete(id, req.user.id);

    if (!project) {
      return res.status(404).json({ error: 'Projektas nerastas' });
    }

    res.json({ message: 'Projektas ištrintas sėkmingai' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
};

export const duplicateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Naujas pavadinimas privalomas' });
    }

    const project = await Project.duplicate(id, req.user.id, name);

    if (!project) {
      return res.status(404).json({ error: 'Originalus projektas nerastas' });
    }

    res.status(201).json({
      message: 'Projektas dubliuotas sėkmingai',
      project: {
        id: project.id,
        name: project.name,
        type: project.type,
        volume: parseFloat(project.volume) || 0,
        created: project.created_at.toISOString().split('T')[0],
        modified: project.updated_at.toISOString().split('T')[0],
        configuration: project.configuration
      }
    });
  } catch (error) {
    console.error('Duplicate project error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
};