const checkAdmin = require('../../src/middlewares/checkAdmin');

describe('CheckAdmin Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  it('deve chamar next() se o userType for admin', () => {
    req.userType = 'admin';
    checkAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('deve retornar 403 se o userType for user', () => {
    req.userType = 'user';
    checkAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 403 se o userType estiver undefined', () => {
    checkAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('deve retornar 403 para qualquer tipo que não seja admin', () => {
    req.userType = 'manager';
    checkAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
