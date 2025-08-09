const db = require('../config/db');

exports.getAll = async () => {
  try {
    const dbClient = db.getDbClient();
    const result = await dbClient.query('SELECT * FROM projects');
    return result.rows;
  } catch (error) {
    throw new Error('Error fetching projects: ' + error.message);
  }
};

exports.create = async ({name, description}) => {
  try {
    const dbClient = db.getDbClient();
    if (!name || !description) {
      throw new Error('Name and description are required');
    }
    const queryValues = [name, description];
    const query = `INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *`;
    const result = await dbClient.query(query, queryValues);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error creating project: ' + error.message);
  }
};
