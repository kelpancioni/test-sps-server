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

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/users` | Listar todos os usuários |
| GET | `/users/:id` | Buscar usuário por ID |
| POST | `/users` | Criar novo usuário |
| PUT | `/users/:id` | Atualizar usuário |
| DELETE | `/users/:id` | Excluir usuário |

**Request Body (Criar/Atualizar Usuário):**
```json
{
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "password": "senha123",
  "type": "user"
}
```

## Estrutura do Projeto

```
src/
├── config/
│   └── auth.js          # Configurações JWT
├── controllers/
│   ├── authController.js    # Controller de autenticação
│   └── userController.js    # Controller de usuários (CRUD)
├── middlewares/
│   └── authMiddleware.js    # Middleware de autenticação JWT
├── repositories/
│   └── userRepository.js    # Banco de dados em memória
├── index.js             # Ponto de entrada da aplicação
└── routes.js            # Definição das rotas
```

## Códigos de Resposta

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 204 | Sem conteúdo (exclusão bem-sucedida) |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 404 | Não encontrado |
| 409 | Conflito (e-mail duplicado) |
| 500 | Erro interno do servidor |

## Validações

- E-mail deve ser único no sistema
- E-mail deve ter formato válido
- Nome, e-mail e senha são obrigatórios na criação
- Token JWT expira em 24 horas
