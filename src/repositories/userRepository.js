// Banco de dados fake em memória
let users = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@admin.com',
    type: 'admin',
    password: 'admin123'
  }
];

let nextId = 2;

const userRepository = {
  findAll() {
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  },

  findById(id) {
    const user = users.find(u => u.id === parseInt(id));
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  findByEmail(email) {
    return users.find(u => u.email === email);
  },

  findByEmailWithPassword(email) {
    return users.find(u => u.email === email);
  },

  create(userData) {
    const newUser = {
      id: nextId++,
      name: userData.name,
      email: userData.email,
      type: userData.type || 'user',
      password: userData.password
    };
    users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  update(id, userData) {
    const index = users.findIndex(u => u.id === parseInt(id));
    if (index === -1) return null;

    const updatedUser = {
      ...users[index],
      name: userData.name !== undefined ? userData.name : users[index].name,
      email: userData.email !== undefined ? userData.email : users[index].email,
      type: userData.type !== undefined ? userData.type : users[index].type,
      password: userData.password !== undefined ? userData.password : users[index].password
    };
    users[index] = updatedUser;
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },

  delete(id) {
    const index = users.findIndex(u => u.id === parseInt(id));
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  },

  emailExists(email, excludeId = null) {
    return users.some(u => u.email === email && u.id !== parseInt(excludeId));
  },

  // Método utilitário para resetar o banco em testes
  _reset() {
    users = [
      {
        id: 1,
        name: 'Admin',
        email: 'admin@admin.com',
        type: 'admin',
        password: 'admin123'
      }
    ];
    nextId = 2;
  }
};

module.exports = userRepository;
