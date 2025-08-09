const service = require('../services/postgres.service');

exports.initializePostgres = async (req, res) => {
  try {
    await service.initializePostgres();
    res.json({ success: true, message: 'PostgreSQL initialized successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.downloadPostgres = async (req, res) => {
  try {
    console.log('Starting PostgreSQL auto-download...');
    await service.downloadPostgres();
    res.json({ success: true, message: 'PostgreSQL binaries downloaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};