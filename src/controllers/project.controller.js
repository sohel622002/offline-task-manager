const service = require('../services/project.service');

exports.getAll = async (req, res) => {
  try {
    const projects = await service.getAll();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const project = await service.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
