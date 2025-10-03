const notFound = (req, res, next) => {
  // Silently ignore webpack HMR requests in development
  if (req.originalUrl.includes('.hot-update.json') || req.originalUrl.includes('.hot-update.js')) {
    return res.status(404).end();
  }
  
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = notFound;


