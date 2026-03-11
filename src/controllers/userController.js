const userRepository = require('../repositories/userRepository');

// Constantes para identificar o usuário admin protegido
const ADMIN_ID = 1;
const ADMIN_EMAIL = 'admin@admin.com';

/**
 * Verifica se o ID corresponde ao usuário admin protegido.
 */
function isAdminUser(id) {
  return parseInt(id) === ADMIN_ID;
}

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

  // POST /users - Criar usuário (apenas admin)
  create(req, res) {
    // Apenas admins podem criar usuários
    if (req.userType !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem criar usuários.' });
    }

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

    // Não permitir criação de usuários com type 'admin'
    const safeType = type === 'admin' ? 'user' : (type || 'user');

    const newUser = userRepository.create({ name, email, type: safeType, password });
    return res.status(201).json(newUser);
  },

  // PUT /users/:id - Atualizar usuário
  // Admin pode editar qualquer usuário (exceto rebaixar o admin).
  // Usuário comum pode editar apenas a si mesmo.
  update(req, res) {
    const { id } = req.params;
    const { name, email, type, password } = req.body;

    const existingUser = userRepository.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Proteção do admin: somente o próprio admin pode editar sua conta
    if (isAdminUser(id) && req.userId !== ADMIN_ID) {
      return res.status(403).json({ error: 'Acesso negado. O usuário administrador principal não pode ser editado por outros usuários.' });
    }

    // Usuário comum só pode editar a si mesmo
    if (req.userType !== 'admin' && req.userId !== parseInt(id)) {
      return res.status(403).json({ error: 'Acesso negado. Você só pode editar seu próprio perfil.' });
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

    // Impedir que o type do admin seja alterado
    const safeData = { name, email, password };
    if (isAdminUser(id)) {
      safeData.type = 'admin'; // Sempre manter admin como admin
    } else if (req.userType !== 'admin') {
      // Usuário comum não pode alterar seu próprio type
      safeData.type = undefined;
    } else {
      safeData.type = type;
    }

    const updatedUser = userRepository.update(id, safeData);
    return res.json(updatedUser);
  },

  // DELETE /users/:id - Excluir usuário (apenas admin)
  delete(req, res) {
    const { id } = req.params;

    // Apenas admins podem excluir usuários
    if (req.userType !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem excluir usuários.' });
    }

    // Impedir exclusão do usuário admin
    if (isAdminUser(id)) {
      return res.status(403).json({ error: 'O usuário administrador principal não pode ser excluído.' });
    }

    const existingUser = userRepository.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    userRepository.delete(id);
    return res.status(204).send();
  }
};

module.exports = userController;