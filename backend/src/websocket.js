// Store connected clients
const clients = new Set();

export function setupWebSocketServer(wss) {
  wss.on('connection', (ws) => {
    // Add new client to the set
    clients.add(ws);
    
    console.log('Client connected, total clients:', clients.size);

    // Handle client disconnect
    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected, total clients:', clients.size);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connection', message: 'Connected to Caja Popular WebSocket server' }));
  });
}

// Function to notify all connected clients
export function notifyClients(data) {
  const message = JSON.stringify(data);
  
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}
