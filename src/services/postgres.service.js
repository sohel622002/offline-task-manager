const db = require('../config/db');

const initializePostgres = () => {
  return db.initializePostgres();
}

const downloadPostgres = async () => {
  await db.downloadAndSetupPostgreSQL();
}

module.exports = { initializePostgres, downloadPostgres }