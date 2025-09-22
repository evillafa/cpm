import Fastify from 'fastify';
import cors from '@fastify/cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { setupRoutes } from './routes.js';
import { setupWebSocketServer } from './websocket.js';
import { setupAmqp } from './amqp.js';

const fastify = Fastify({
  logger: true
});

// Register CORS
await fastify.register(cors, {
  origin: true // Allow all origins for development
});

// Setup HTTP routes
setupRoutes(fastify);

// Setup AMQP connection
await setupAmqp();

// Start the fastify server
const PORT = process.env.PORT || 3001;
try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Server is running on port ${PORT}`);
  
  // Setup WebSocket server on the same port
  const wss = new WebSocketServer({ server: fastify.server });
  setupWebSocketServer(wss);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await fastify.close();
  process.exit(0);
});
