module.exports = (req, res, next) => {
  if(req.user.role !== 'admin' || !req.user.isAdmin) {
    return res.status(403).json({
      message: "Admin privileges required"
    });
  }
  next();
}; 