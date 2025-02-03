const { securityHeaders, authLimiter, csrfProtection } = require('../middleware/security');

router.use(securityHeaders);
router.use(csrfProtection);

router.post('/login', 
  authLimiter,
  validateLoginInput, 
  loginController
);

router.post('/signup', 
  authLimiter,
  validateSignupInput,
  signupController
); 