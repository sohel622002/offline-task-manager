const authService = require("../services/auth.service.js");

exports.signup = async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    const data = await authService.signup({ email, password, fullName });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await authService.login({ email, password });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

