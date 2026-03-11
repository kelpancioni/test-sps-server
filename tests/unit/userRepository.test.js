const userRepository = require('../../src/repositories/userRepository');

describe('UserRepository', () => {
  beforeEach(() => {
    userRepository._reset();
  });

  describe('findAll', () => {
    it('deve retornar o admin pré-cadastrado', () => {
      const users = userRepository.findAll();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('admin@admin.com');
    });

    it('não deve retornar a senha dos usuários', () => {
      const users = userRepository.findAll();
      users.forEach(u => expect(u.password).toBeUndefined());
    });
  });

  describe('findById', () => {
    it('deve retornar usuário pelo ID', () => {
      const user = userRepository.findById(1);
      expect(user).not.toBeNull();
      expect(user.email).toBe('admin@admin.com');
    });

    it('não deve retornar a senha', () => {
      const user = userRepository.findById(1);
      expect(user.password).toBeUndefined();
    });

    it('deve retornar null para ID inexistente', () => {
      const user = userRepository.findById(999);
      expect(user).toBeNull();
    });

    it('deve aceitar ID como string', () => {
      const user = userRepository.findById('1');
      expect(user).not.toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('deve retornar usuário pelo email', () => {
      const user = userRepository.findByEmail('admin@admin.com');
      expect(user).toBeDefined();
      expect(user.id).toBe(1);
    });

    it('deve retornar undefined para email inexistente', () => {
      const user = userRepository.findByEmail('naoexiste@test.com');
      expect(user).toBeUndefined();
    });
  });

  describe('findByEmailWithPassword', () => {
    it('deve retornar usuário com senha', () => {
      const user = userRepository.findByEmailWithPassword('admin@admin.com');
      expect(user).toBeDefined();
      expect(user.password).toBe('admin123');
    });
  });

  describe('create', () => {
    it('deve criar um novo usuário e retornar sem senha', () => {
      const newUser = userRepository.create({
        name: 'Test User',
        email: 'test@test.com',
        password: '123456'
      });
      expect(newUser.id).toBe(2);
      expect(newUser.name).toBe('Test User');
      expect(newUser.email).toBe('test@test.com');
      expect(newUser.type).toBe('user');
      expect(newUser.password).toBeUndefined();
    });

    it('deve respeitar o type fornecido', () => {
      const newUser = userRepository.create({
        name: 'Manager',
        email: 'manager@test.com',
        type: 'manager',
        password: '123456'
      });
      expect(newUser.type).toBe('manager');
    });

    it('deve incrementar o ID automaticamente', () => {
      const user1 = userRepository.create({ name: 'A', email: 'a@a.com', password: '1' });
      const user2 = userRepository.create({ name: 'B', email: 'b@b.com', password: '2' });
      expect(user2.id).toBe(user1.id + 1);
    });
  });

  describe('update', () => {
    it('deve atualizar os dados do usuário', () => {
      const updated = userRepository.update(1, { name: 'Admin Updated' });
      expect(updated.name).toBe('Admin Updated');
      expect(updated.email).toBe('admin@admin.com');
    });

    it('não deve retornar a senha', () => {
      const updated = userRepository.update(1, { name: 'X' });
      expect(updated.password).toBeUndefined();
    });

    it('deve retornar null para ID inexistente', () => {
      const updated = userRepository.update(999, { name: 'X' });
      expect(updated).toBeNull();
    });

    it('deve manter campos não informados', () => {
      const updated = userRepository.update(1, {});
      expect(updated.name).toBe('Admin');
      expect(updated.email).toBe('admin@admin.com');
    });
  });

  describe('delete', () => {
    it('deve excluir um usuário existente', () => {
      userRepository.create({ name: 'ToDelete', email: 'del@del.com', password: '123' });
      const result = userRepository.delete(2);
      expect(result).toBe(true);
      expect(userRepository.findById(2)).toBeNull();
    });

    it('deve retornar false para ID inexistente', () => {
      const result = userRepository.delete(999);
      expect(result).toBe(false);
    });
  });

  describe('emailExists', () => {
    it('deve retornar true para email existente', () => {
      expect(userRepository.emailExists('admin@admin.com')).toBe(true);
    });

    it('deve retornar false para email inexistente', () => {
      expect(userRepository.emailExists('naoexiste@test.com')).toBe(false);
    });

    it('deve ignorar o ID excluído', () => {
      expect(userRepository.emailExists('admin@admin.com', 1)).toBe(false);
    });

    it('deve retornar true se email pertence a outro ID', () => {
      userRepository.create({ name: 'User2', email: 'user2@test.com', password: '123' });
      expect(userRepository.emailExists('user2@test.com', 1)).toBe(true);
    });
  });
});
