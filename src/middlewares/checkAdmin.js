/**
 * Middleware de autorização - verifica se o usuário autenticado é admin.
 * Deve ser usado APÓS o authMiddleware (que já popula req.userType).
 */
module.exports = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
  }

  return next();
};
