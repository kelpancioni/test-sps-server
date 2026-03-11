const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const authConfig = require('../../src/config/auth');
const userRepository = require('../../src/repositories/userRepository');

// Helper: gera token válido
function generateToken(payload) {
  return jwt.sign(payload, authConfig.secret, { expiresIn: '1h' });
}

describe('User Endpoints', () => {
  let adminToken;
  let userToken;

  beforeEach(() => {
    userRepository._reset();
    adminToken = generateToken({ id: 1, email: 'admin@admin.com' });

    // Cria um usuário comum para testes
    userRepository.create({ name: 'Common User', email: 'user@test.com', password: '123456' });
    userToken = generateToken({ id: 2, email: 'user@test.com' });
  });

  // --- Rotas protegidas sem token ---
  describe('Rotas protegidas sem autenticação', () => {
    it('GET /users deve retornar 401 sem token', async () => {
      const res = await request(app).get('/users');
      expect(res.status).toBe(401);
    });

    it('POST /users deve retornar 401 sem token', async () => {
      const res = await request(app).post('/users').send({ name: 'X', email: 'x@x.com', password: '1' });
      expect(res.status).toBe(401);
    });
  });

  // --- GET /users ---
  describe('GET /users', () => {
    it('deve listar todos os usuários (admin)', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('deve listar todos os usuários (user comum)', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // --- GET /users/:id ---
  describe('GET /users/:id', () => {
    it('deve retornar um usuário por ID', async () => {
      const res = await request(app)
        .get('/users/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('admin@admin.com');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .get('/users/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  // --- POST /users ---
  describe('POST /users', () => {
    it('admin deve criar um novo usuário', async () => {
      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Novo User', email: 'novo@test.com', password: '123456' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Novo User');
      expect(res.body.type).toBe('user');
      expect(res.body.password).toBeUndefined();
    });

    it('usuário comum NÃO deve criar usuários (403)', async () => {
      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'X', email: 'x@x.com', password: '1' });

      expect(res.status).toBe(403);
    });

    it('deve retornar 400 se faltar campos obrigatórios', async () => {
      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Sem Email' });

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para email inválido', async () => {
      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Bad Email', email: 'invalido', password: '123' });

      expect(res.status).toBe(400);
    });

    it('deve retornar 409 para email duplicado', async () => {
      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Dup', email: 'admin@admin.com', password: '123' });

      expect(res.status).toBe(409);
    });

    it('não deve permitir criar usuário com type admin', async () => {
      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Fake Admin', email: 'fake@admin.com', password: '123', type: 'admin' });

      expect(res.status).toBe(201);
      expect(res.body.type).toBe('user');
    });
  });

  // --- PUT /users/:id ---
  describe('PUT /users/:id', () => {
    it('admin deve atualizar qualquer usuário', async () => {
      const res = await request(app)
        .put('/users/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });

    it('usuário comum deve atualizar apenas a si mesmo', async () => {
      const res = await request(app)
        .put('/users/2')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Self Update' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Self Update');
    });

    it('usuário comum NÃO deve atualizar outro usuário (403)', async () => {
      // Cria terceiro user
      userRepository.create({ name: 'Third', email: 'third@test.com', password: '123' });

      const res = await request(app)
        .put('/users/3')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked' });

      expect(res.status).toBe(403);
    });

    it('não-admin NÃO deve editar o admin principal (403)', async () => {
      const res = await request(app)
        .put('/users/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked Admin' });

      expect(res.status).toBe(403);
    });

    it('admin pode editar a si mesmo', async () => {
      const res = await request(app)
        .put('/users/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admin Editado' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Admin Editado');
      expect(res.body.type).toBe('admin'); // type admin é preservado
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .put('/users/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Ghost' });

      expect(res.status).toBe(404);
    });

    it('deve retornar 400 para email inválido na atualização', async () => {
      const res = await request(app)
        .put('/users/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'invalido' });

      expect(res.status).toBe(400);
    });

    it('deve retornar 409 para email duplicado na atualização', async () => {
      const res = await request(app)
        .put('/users/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'admin@admin.com' });

      expect(res.status).toBe(409);
    });

    it('usuário comum não deve alterar seu próprio type', async () => {
      const res = await request(app)
        .put('/users/2')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.type).toBe('user'); // type não muda
    });
  });

  // --- DELETE /users/:id ---
  describe('DELETE /users/:id', () => {
    it('admin deve excluir um usuário', async () => {
      const res = await request(app)
        .delete('/users/2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it('usuário comum NÃO deve excluir usuários (403)', async () => {
      const res = await request(app)
        .delete('/users/2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('não deve permitir excluir o admin principal (403)', async () => {
      const res = await request(app)
        .delete('/users/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(403);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .delete('/users/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  // --- Rota pública ---
  describe('GET /', () => {
    it('deve retornar mensagem da API', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
    });
  });
});
