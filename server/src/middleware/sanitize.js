const xss = require('xss');

exports.sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key].trim());
      }
    });
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
}; 