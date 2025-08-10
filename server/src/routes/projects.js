import express from 'express';
import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  duplicateProject,
  projectValidation
} from '../controllers/projectController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All project routes require authentication
router.use(authenticateToken);

// Projects CRUD
router.get('/', getProjects);
router.post('/', projectValidation, createProject);
router.get('/:id', getProject);
router.put('/:id', projectValidation, updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/duplicate', duplicateProject);

export default router;