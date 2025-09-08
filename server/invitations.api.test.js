// server/invitations.api.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import invitationsRoutes from './routes/invitations.js';

const app = express();
app.use(express.json());
app.use('/api/invites', invitationsRoutes);

describe('Invitations API', () => {
  const mockUser1 = 'user-1';
  const mockUser2 = 'user-2';
  const mockProject1 = 'proj-1';
  const mockProject2 = 'proj-2';

  beforeEach(async () => {
    // Clear invitations data for each test
    // In a real scenario, you'd have a test database or mock the data layer
    // For this test, we'll assume the routes handle data isolation
  });

  describe('POST /api/invites', () => {
    it('should create a new invitation', async () => {
      const invitationData = {
        projectId: mockProject1,
        email: 'newuser@example.com',
        role: 'member'
      };

      const response = await request(app)
        .post('/api/invites')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .send(invitationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Invitation sent successfully');
      expect(response.body.data.email).toBe('newuser@example.com');
      expect(response.body.data.projectName).toBeDefined();
      expect(response.body.data.role).toBe('member');
      expect(response.body.data.expiresAt).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/invites')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Missing required fields: projectId, email');
    });

    it('should return 400 for invalid role', async () => {
      const invitationData = {
        projectId: mockProject1,
        email: 'test@example.com',
        role: 'invalid-role'
      };

      const response = await request(app)
        .post('/api/invites')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .send(invitationData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid role. Must be one of: owner, admin, member');
    });

    it('should return 404 for non-existent project', async () => {
      const invitationData = {
        projectId: 'non-existent',
        email: 'test@example.com',
        role: 'member'
      };

      const response = await request(app)
        .post('/api/invites')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .send(invitationData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Project not found');
    });

    it('should return 403 for non-admin user trying to invite', async () => {
      const invitationData = {
        projectId: mockProject1,
        email: 'test@example.com',
        role: 'member'
      };

      const response = await request(app)
        .post('/api/invites')
        .set('X-User-Id', 'user-3') // Non-member user
        .set('X-User-Email', 'nonmember@example.com')
        .send(invitationData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied: Only project owners and admins can send invitations');
    });
  });

  describe('POST /api/invites/:token/accept', () => {
    let invitationToken;

    beforeEach(async () => {
      // Create an invitation first
      const invitationData = {
        projectId: mockProject1,
        email: 'acceptuser@example.com',
        role: 'member'
      };

      const createResponse = await request(app)
        .post('/api/invites')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .send(invitationData);

      invitationToken = createResponse.body.data.token;
    });

    it('should accept a valid invitation', async () => {
      const response = await request(app)
        .post(`/api/invites/${invitationToken}/accept`)
        .send({
          userId: 'user-4',
          userEmail: 'acceptuser@example.com'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Invitation accepted successfully');
      expect(response.body.data.projectId).toBe(mockProject1);
      expect(response.body.data.role).toBe('member');
      expect(response.body.data.joinedAt).toBeDefined();
    });

    it('should return 400 for missing user data', async () => {
      const response = await request(app)
        .post(`/api/invites/${invitationToken}/accept`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Missing required fields: userId, userEmail');
    });

    it('should return 404 for invalid token', async () => {
      const response = await request(app)
        .post('/api/invites/invalid-token/accept')
        .send({
          userId: 'user-4',
          userEmail: 'test@example.com'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired invitation');
    });
  });

  describe('GET /api/invites', () => {
    it('should return user invitations', async () => {
      // First create an invitation for the user
      const invitationData = {
        projectId: mockProject1,
        email: 'inviteduser@example.com',
        role: 'member'
      };

      await request(app)
        .post('/api/invites')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .send(invitationData);

      // Then get invitations for the invited user
      const response = await request(app)
        .get('/api/invites')
        .set('X-User-Id', 'user-5')
        .set('X-User-Email', 'inviteduser@example.com')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/invites/:token', () => {
    let invitationToken;

    beforeEach(async () => {
      // Create an invitation first
      const invitationData = {
        projectId: mockProject1,
        email: 'tokenuser@example.com',
        role: 'member'
      };

      const createResponse = await request(app)
        .post('/api/invites')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .send(invitationData);

      invitationToken = createResponse.body.data.token;
    });

    it('should return invitation details for valid token', async () => {
      const response = await request(app)
        .get(`/api/invites/${invitationToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projectId).toBe(mockProject1);
      expect(response.body.data.email).toBe('tokenuser@example.com');
      expect(response.body.data.role).toBe('member');
      expect(response.body.data.expiresAt).toBeDefined();
    });

    it('should return 404 for invalid token', async () => {
      const response = await request(app)
        .get('/api/invites/invalid-token')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invitation not found');
    });
  });

  describe('DELETE /api/invites/:id', () => {
    let invitationId;

    beforeEach(async () => {
      // Create an invitation first
      const invitationData = {
        projectId: mockProject1,
        email: 'canceluser@example.com',
        role: 'member'
      };

      const createResponse = await request(app)
        .post('/api/invites')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .send(invitationData);

      invitationId = createResponse.body.data.id;
    });

    it('should cancel an invitation', async () => {
      const response = await request(app)
        .delete(`/api/invites/${invitationId}`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Invitation cancelled successfully');
    });

    it('should return 404 for non-existent invitation', async () => {
      const response = await request(app)
        .delete('/api/invites/non-existent')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'john.doe@example.com')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invitation not found');
    });

    it('should return 403 for unauthorized cancellation', async () => {
      const response = await request(app)
        .delete(`/api/invites/${invitationId}`)
        .set('X-User-Id', 'user-3') // Non-member user
        .set('X-User-Email', 'nonmember@example.com')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied: Only the inviter or project admins can cancel invitations');
    });
  });
});
