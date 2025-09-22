import * as amqplib from 'amqplib';
import { notifyClients } from './websocket.js';

// AMQP connection and channel
let connection = null;
let channel = null;

// Queue and exchange names
const REQUEST_QUEUE = 'credit-rating.requested.q';
const COMPLETION_QUEUE = 'credit-rating.completed.q';
const EXCHANGE = 'credit-rating.x';
const REQUEST_ROUTING_KEY = 'credit-rating.requested';
const COMPLETION_ROUTING_KEY = 'credit-rating.completed';

export async function setupAmqp() {
  try {
    // In a real environment, this would come from environment variables
    const amqpUrl = process.env.AMQP_URL || 'amqp://localhost';
    
    console.log(`Connecting to AMQP server at ${amqpUrl}...`);
    
    // Connect to RabbitMQ
    connection = await amqplib.connect(amqpUrl);
    channel = await connection.createChannel();
    
    // Setup exchange
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    
    // Setup queues
    await channel.assertQueue(REQUEST_QUEUE, { durable: true });
    await channel.assertQueue(COMPLETION_QUEUE, { durable: true });
    
    // Bind queues to exchange
    await channel.bindQueue(REQUEST_QUEUE, EXCHANGE, REQUEST_ROUTING_KEY);
    await channel.bindQueue(COMPLETION_QUEUE, EXCHANGE, COMPLETION_ROUTING_KEY);
    
    // Start consuming completion messages
    await startCompletionConsumer();
    
    console.log('AMQP connection established');
    
    return { connection, channel };
  } catch (error) {
    console.error('Failed to connect to AMQP:', error);
    // For development, we'll continue even if AMQP fails
    console.log('Continuing without AMQP connection (for development)');
    return { connection: null, channel: null };
  }
}

/**
 * Start consuming messages from the completion queue
 */
async function startCompletionConsumer() {
  if (!channel) {
    console.error('AMQP channel not available');
    return;
  }
  
  console.log(`Starting consumer for queue: ${COMPLETION_QUEUE}`);
  
  // Consume messages from the completion queue
  channel.consume(COMPLETION_QUEUE, async (msg) => {
    if (!msg) return;
    
    try {
      const content = JSON.parse(msg.content.toString());
      console.log(`Received credit rating completion for assessment ID: ${content.assessmentId}`);
      
      // Notify all connected clients about the completed assessment
      notifyClients(content);
      
      // Acknowledge the message
      channel.ack(msg);
    } catch (error) {
      console.error('Error processing completion message:', error);
      // Negative acknowledge in case of error
      channel.nack(msg, false, false);
    }
  });
}

export async function publishCreditRatingRequest(data) {
  if (!channel) {
    console.log('AMQP channel not available, skipping message publish');
    return;
  }
  
  try {
    const message = Buffer.from(JSON.stringify(data));
    channel.publish(EXCHANGE, REQUEST_ROUTING_KEY, message, {
      persistent: true
    });
    
    console.log(`Message published to ${EXCHANGE} with routing key ${REQUEST_ROUTING_KEY}:`, data.assessmentId);
  } catch (error) {
    console.error('Failed to publish message:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
});
