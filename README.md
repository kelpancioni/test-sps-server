# Test SPS Server

API RESTful para gerenciamento de usuários desenvolvida com Node.js e Express.

## Requisitos

- Node.js 18+
- npm ou yarn

## Instalação

```bash
npm install
```

## Executando o projeto

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# O servidor será iniciado em http://localhost:3001
```

## Usuário Admin Pré-cadastrado

- **E-mail:** admin@admin.com
- **Senha:** admin123
- **Tipo:** admin

## Sistema de Roles (Autorização)

A API implementa um sistema de controle de acesso baseado em roles (tipos de usuário):

### Tipos de usuário

| Tipo | Descrição |
|------|-----------|
| `admin` | Acesso total ao sistema. Pode criar, editar e excluir qualquer usuário. |
| `user` | Acesso limitado. Pode visualizar todos os usuários, mas só pode editar seu próprio perfil. |

### Regras de autorização

| Ação | Admin | Usuário Comum |
|------|-------|---------------|
| Listar usuários (`GET /users`) | ✅ | ✅ |
| Buscar usuário por ID (`GET /users/:id`) | ✅ | ✅ |
| Criar usuário (`POST /users`) | ✅ | ❌ (403) |
| Editar qualquer usuário (`PUT /users/:id`) | ✅ | ❌ (403) |
| Editar próprio perfil (`PUT /users/:id`) | ✅ | ✅ |
| Excluir usuário (`DELETE /users/:id`) | ✅ | ❌ (403) |

### Proteção do Admin Principal

O usuário admin principal (ID 1, `admin@admin.com`) possui proteção especial:

- **Não pode ser excluído** por nenhum usuário (nem por ele mesmo).
- **Não pode ser editado** por outros usuários — somente o próprio admin pode editar sua conta.
- **Seu tipo (`admin`) não pode ser alterado** — ele sempre permanecerá como admin.
- **Novos usuários não podem ser criados com tipo `admin`** — apenas o tipo `user` é permitido na criação.

## Rotas da API

### Autenticação

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|---------------|
| POST | `/auth/login` | Login do usuário | Não |

**Request Body (Login):**
```json
{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@admin.com",
    "type": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Usuários (Rotas Protegidas)

Todas as rotas abaixo requerem o header `Authorization: Bearer <token>`

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | `/users` | Listar todos os usuários | Qualquer autenticado |
| GET | `/users/:id` | Buscar usuário por ID | Qualquer autenticado |
| POST | `/users` | Criar novo usuário | Apenas admin |
| PUT | `/users/:id` | Atualizar usuário | Admin ou próprio usuário |
| DELETE | `/users/:id` | Excluir usuário | Apenas admin |

**Request Body (Criar/Atualizar Usuário):**
```json
{
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "password": "senha123",
  "type": "user"
}
```

## Testes

O projeto possui uma suíte completa de testes unitários e de integração usando **Jest** e **Supertest**.

### Executando os testes

```bash
# Rodar todos os testes
npm test

# Rodar em modo watch (re-executa ao salvar)
npm run test:watch

# Rodar com relatório de cobertura
npm run test:coverage
```

### Estrutura de testes

```
tests/
├── setup.js                          # Configuração do ambiente de teste
├── unit/
│   ├── userRepository.test.js        # Testes do repositório (CRUD, email único)
│   ├── authMiddleware.test.js        # Testes do middleware JWT (token válido/inválido/expirado)
│   └── checkAdmin.test.js            # Testes do middleware de admin
└── integration/
    ├── auth.test.js                  # Testes de login (credenciais válidas/inválidas, JWT)
    └── users.test.js                 # Testes CRUD de usuários (autorização, validações)
```

### Cobertura

| Métrica    | Cobertura |
|------------|-----------|
| Statements | ~99%      |
| Branches   | ~95%      |
| Functions  | ~96%      |
| Lines      | ~99%      |

## Estrutura do Projeto

```
src/
├── config/
│   └── auth.js              # Configurações JWT
├── controllers/
│   ├── authController.js    # Controller de autenticação
│   └── userController.js    # Controller de usuários (CRUD + autorização)
├── middlewares/
│   ├── authMiddleware.js    # Middleware de autenticação JWT (popula userType)
│   └── checkAdmin.js       # Middleware de autorização (somente admin)
├── repositories/
│   └── userRepository.js   # Banco de dados em memória
├── app.js                   # Configuração do Express (usado nos testes)
├── index.js                 # Ponto de entrada da aplicação
└── routes.js                # Definição das rotas
tests/                        # Suíte de testes (Jest + Supertest)
├── setup.js
├── unit/
└── integration/
```

## Códigos de Resposta

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 204 | Sem conteúdo (exclusão bem-sucedida) |
| 400 | Requisição inválida |
| 401 | Não autorizado (token ausente ou inválido) |
| 403 | Proibido (sem permissão para a ação) |
| 404 | Não encontrado |
| 409 | Conflito (e-mail duplicado) |
| 500 | Erro interno do servidor |

## Validações

- E-mail deve ser único no sistema
- E-mail deve ter formato válido
- Nome, e-mail e senha são obrigatórios na criação
- Token JWT expira em 24 horas
- Apenas administradores podem criar e excluir usuários
- Usuários comuns só podem editar seu próprio perfil
- O admin principal (ID 1) não pode ser excluído nem editado por outros