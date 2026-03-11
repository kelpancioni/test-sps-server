const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middlewares/authMiddleware');
const authConfig = require('../../src/config/auth');
const userRepository = require('../../src/repositories/userRepository');

describe('AuthMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    userRepository._reset();
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  it('deve retornar 401 se não houver header de autorização', () => {
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se o token não tiver duas partes', () => {
    req.headers.authorization = 'TokenSemEspaco';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
  });

  it('deve retornar 401 se o scheme não for Bearer', () => {
    const token = jwt.sign({ id: 1, email: 'admin@admin.com' }, authConfig.secret);
    req.headers.authorization = `Basic ${token}`;
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token mal formatado' });
  });

  it('deve retornar 401 para token inválido', () => {
    req.headers.authorization = 'Bearer token.invalido.aqui';
    authMiddleware(req, res, next);
    // jwt.verify é async com callback, precisa aguardar
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('deve retornar 401 para token expirado', (done) => {
    const token = jwt.sign({ id: 1, email: 'admin@admin.com' }, authConfig.secret, { expiresIn: '0s' });
    req.headers.authorization = `Bearer ${token}`;
    // Pequeno delay para garantir expiração
    setTimeout(() => {
      authMiddleware(req, res, next);
      setTimeout(() => {
        expect(res.status).toHaveBeenCalledWith(401);
        done();
      }, 50);
    }, 50);
  });

  it('deve chamar next() e popular req para token válido de admin', (done) => {
    const token = jwt.sign({ id: 1, email: 'admin@admin.com' }, authConfig.secret, { expiresIn: '1h' });
    req.headers.authorization = `Bearer ${token}`;
    authMiddleware(req, res, () => {
      expect(req.userId).toBe(1);
      expect(req.userEmail).toBe('admin@admin.com');
      expect(req.userType).toBe('admin');
      done();
    });
  });

  it('deve definir userType como user para usuário não encontrado', (done) => {
    const token = jwt.sign({ id: 999, email: 'ghost@test.com' }, authConfig.secret, { expiresIn: '1h' });
    req.headers.authorization = `Bearer ${token}`;
    authMiddleware(req, res, () => {
      expect(req.userType).toBe('user');
      done();
    });
  });
});
