require('dotenv').config();
const http = require('http');
const app = require('./app');
const { createSignalingServer } = require('./ws/signaling');

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

createSignalingServer(server);

server.listen(PORT, () => {
  console.log(`MindBridge backend listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = server;
