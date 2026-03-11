const { Router } = require('express');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const authMiddleware = require('./middlewares/authMiddleware');

const routes = Router();

// Rota pública
routes.get('/', (req, res) => {
  res.json({ message: 'API SPS Group - Backend' });
});

// Rota de autenticação (pública)
routes.post('/auth/login', authController.login);

// Rotas protegidas de usuários
routes.get('/users', authMiddleware, userController.index);
routes.get('/users/:id', authMiddleware, userController.show);
routes.post('/users', authMiddleware, userController.create);
routes.put('/users/:id', authMiddleware, userController.update);
routes.delete('/users/:id', authMiddleware, userController.delete);

module.exports = routes;
