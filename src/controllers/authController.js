const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const authConfig = require('../config/auth');

const authController = {
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const user = userRepository.findByEmailWithPassword(email);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      authConfig.secret,
      { expiresIn: authConfig.expiresIn }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      user: userWithoutPassword,
      token
    });
  }
};

module.exports = authController;
