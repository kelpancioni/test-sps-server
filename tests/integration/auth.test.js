const request = require('supertest');
const app = require('../../src/app');
const userRepository = require('../../src/repositories/userRepository');

describe('Auth Endpoints', () => {
  beforeEach(() => {
    userRepository._reset();
  });

  describe('POST /auth/login', () => {
    it('deve fazer login com credenciais válidas do admin', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@admin.com', password: 'admin123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('admin@admin.com');
      expect(res.body.user.password).toBeUndefined();
    });

    it('deve retornar 401 para email incorreto', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'wrong@email.com', password: 'admin123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Credenciais inválidas');
    });

    it('deve retornar 401 para senha incorreta', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@admin.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Credenciais inválidas');
    });

    it('deve retornar 400 se email não for fornecido', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ password: 'admin123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('E-mail e senha são obrigatórios');
    });

    it('deve retornar 400 se senha não for fornecida', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@admin.com' });

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 se body estiver vazio', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });

    it('o token retornado deve ser um JWT válido', async () => {
      const jwt = require('jsonwebtoken');
      const authConfig = require('../../src/config/auth');

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@admin.com', password: 'admin123' });

      const decoded = jwt.verify(res.body.token, authConfig.secret);
      expect(decoded).toHaveProperty('id', 1);
      expect(decoded).toHaveProperty('email', 'admin@admin.com');
    });
  });
});
