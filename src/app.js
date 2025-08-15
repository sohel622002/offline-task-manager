const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const postgresRoutes = require('./routes/postgres.routes')
const projectRoutes = require('./routes/project.routes');
const errorHandler = require('./middleware/errorHandler');
const socketService = require("./utils/socket");

const app = express();
app.use(cors());

const server = http.createServer(app);

// Initialize socket
socketService.initSocket(server);

app.use(express.json());

app.use('/projects', projectRoutes);
app.use('/postgres', postgresRoutes);

app.use(errorHandler);

module.exports = server;
