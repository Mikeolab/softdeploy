// server/project-members.api.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import projectMembersRoutes from './routes/projectMembers.js';

const app = express();
app.use(express.json());
app.use('/api/projects', projectMembersRoutes);

describe('Project Members API', () => {
  const mockUser1 = 'user-1';
  const mockUser2 = 'user-2';
  const mockUser3 = 'user-3';
  const mockProject1 = 'proj-1';
  const mockProject2 = 'proj-2';

  describe('GET /api/projects/:projectId/members', () => {
    it('should return project members for project owner', async () => {
      const response = await request(app)
        .get(`/api/projects/${mockProject1}/members`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should include the owner and any other members
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return project members for project member', async () => {
      const response = await request(app)
        .get(`/api/projects/${mockProject1}/members`)
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'jane.smith@example.com')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 403 for non-member user', async () => {
      const response = await request(app)
        .get(`/api/projects/${mockProject1}/members`)
        .set('X-User-Id', mockUser3)
        .set('X-User-Email', 'nonmember@example.com')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied: You are not a member of this project');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent/members')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Project not found');
    });
  });

  describe('PUT /api/projects/:projectId/members/:userId', () => {
    it('should update member role by project owner', async () => {
      const response = await request(app)
        .put(`/api/projects/${mockProject1}/members/${mockUser2}`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Member role updated successfully');
      expect(response.body.data.role).toBe('admin');
    });

    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .put(`/api/projects/${mockProject1}/members/${mockUser2}`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .send({ role: 'invalid-role' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid role. Must be one of: owner, admin, member');
    });

    it('should return 400 for self-role change', async () => {
      const response = await request(app)
        .put(`/api/projects/${mockProject1}/members/${mockUser1}`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .send({ role: 'admin' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('You cannot change your own role');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .put(`/api/projects/${mockProject1}/members/${mockUser2}`)
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'jane.smith@example.com')
        .send({ role: 'admin' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied: Requires owner or admin role. Your role: member');
    });

    it('should return 404 for non-existent member', async () => {
      const response = await request(app)
        .put(`/api/projects/${mockProject1}/members/non-existent`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .send({ role: 'admin' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Member not found');
    });
  });

  describe('DELETE /api/projects/:projectId/members/:userId', () => {
    it('should remove member by project owner', async () => {
      const response = await request(app)
        .delete(`/api/projects/${mockProject1}/members/${mockUser2}`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Member removed successfully');
      expect(response.body.data.userId).toBe(mockUser2);
    });

    it('should return 400 for self-removal', async () => {
      const response = await request(app)
        .delete(`/api/projects/${mockProject1}/members/${mockUser1}`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('You cannot remove yourself from the project');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .delete(`/api/projects/${mockProject1}/members/${mockUser2}`)
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'jane.smith@example.com')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied: Requires owner or admin role. Your role: member');
    });

    it('should return 404 for non-existent member', async () => {
      const response = await request(app)
        .delete(`/api/projects/${mockProject1}/members/non-existent`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Member not found');
    });
  });

  describe('GET /api/projects/personal', () => {
    it('should return user personal projects', async () => {
      const response = await request(app)
        .get('/api/projects/personal')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/projects/invited', () => {
    it('should return projects user is invited to', async () => {
      const response = await request(app)
        .get('/api/projects/invited')
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'jane.smith@example.com')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should include projects where user is a member
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
