const express = require('express');
const router = express.Router();
const controller = require('../controllers/postgres.controller');

router.post('/download', controller.downloadPostgres);
router.post('/initialize', controller.initializePostgres);

module.exports = router;