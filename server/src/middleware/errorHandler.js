export function notFound(req, res) {
  res.status(404).json({ message: 'Ressource introuvable.' });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Session invalide ou expirée.' });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Identifiant invalide.' });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'Cette valeur existe déjà.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Données invalides.' });
  }
  console.error(error);
  res.status(error.status || 500).json({
    message: error.status ? error.message : 'Une erreur serveur est survenue.'
  });
}
