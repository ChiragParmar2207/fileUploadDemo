import logger from '../config/logger.js';

/**
 * Request Logger Middleware
 * Logs all incoming requests and outgoing responses
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming Request', {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
    },
    ip: req.ip,
  });

  // Capture original res.json
  const originalJson = res.json;

  // Override res.json to log response
  res.json = function (data) {
    const duration = Date.now() - startTime;

    logger.info('Outgoing Response', {
      method: req.method,
      url: req.url,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseData: data,
    });

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Error Logger Middleware
 * Logs all errors
 */
export const errorLogger = (err, req, res, next) => {
  logger.error('Error occurred', {
    method: req.method,
    url: req.url,
    path: req.path,
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
    },
    body: req.body,
  });

  next(err);
};
