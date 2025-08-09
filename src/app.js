const express = require("express");
const cors = require("cors");

const postgresRoutes = require('./routes/postgres.routes')
const projectRoutes = require('./routes/project.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/projects', projectRoutes);
app.use('/postgres', postgresRoutes);

app.use(errorHandler);

module.exports = app;
