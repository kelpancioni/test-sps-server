const userRepository = require('../repositories/userRepository');

const userController = {
  // GET /users - Listar todos
  index(req, res) {
    const users = userRepository.findAll();
    return res.json(users);
  },

  // GET /users/:id - Buscar por ID
  show(req, res) {
    const { id } = req.params;
    const user = userRepository.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(user);
  },

  // POST /users - Criar usuário
  create(req, res) {
    const { name, email, type, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
    }

    // Validar formato de e-mail básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de e-mail inválido' });
    }

    // Verificar se e-mail já existe
    if (userRepository.emailExists(email)) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const newUser = userRepository.create({ name, email, type, password });
    return res.status(201).json(newUser);
  },

  // PUT /users/:id - Atualizar usuário
  update(req, res) {
    const { id } = req.params;
    const { name, email, type, password } = req.body;

    const existingUser = userRepository.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Se estiver atualizando o e-mail, validar formato e unicidade
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Formato de e-mail inválido' });
      }

      if (userRepository.emailExists(email, id)) {
        return res.status(409).json({ error: 'E-mail já cadastrado por outro usuário' });
      }
    }

    const updatedUser = userRepository.update(id, { name, email, type, password });
    return res.json(updatedUser);
  },

  // DELETE /users/:id - Excluir usuário
  delete(req, res) {
    const { id } = req.params;

    const existingUser = userRepository.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    userRepository.delete(id);
    return res.status(204).send();
  }
};

module.exports = userController;
