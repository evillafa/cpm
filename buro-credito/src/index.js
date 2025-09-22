import * as amqplib from 'amqplib';
import { generateCreditScore } from './credit-score.js';

// Queue names
const REQUEST_QUEUE = 'credit-rating.requested.q';
const COMPLETION_QUEUE = 'credit-rating.completed.q';
const EXCHANGE = 'credit-rating.x';
const COMPLETION_ROUTING_KEY = 'credit-rating.completed';

// AMQP connection and channel
let connection = null;
let channel = null;

async function setupAmqp() {
  try {
    // Connect to RabbitMQ
    const amqpUrl = process.env.AMQP_URL || 'amqp://localhost';
    console.log(`Connecting to AMQP server at ${amqpUrl}...`);
    
    connection = await amqplib.connect(amqpUrl);
    channel = await connection.createChannel();
    
    // Setup exchange
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    
    // Setup queues
    await channel.assertQueue(REQUEST_QUEUE, { durable: true });
    await channel.assertQueue(COMPLETION_QUEUE, { durable: true });
    
    // Bind completion queue to exchange
    await channel.bindQueue(COMPLETION_QUEUE, EXCHANGE, COMPLETION_ROUTING_KEY);
    
    console.log('AMQP connection established');
    return { connection, channel };
  } catch (error) {
    console.error('Failed to connect to AMQP:', error);
    process.exit(1);
  }
}

async function startConsumer() {
  if (!channel) {
    console.error('AMQP channel not available');
    return;
  }
  
  console.log(`Starting consumer for queue: ${REQUEST_QUEUE}`);
  
  // Consume messages from the request queue
  channel.consume(REQUEST_QUEUE, async (msg) => {
    if (!msg) return;
    
    try {
      const content = JSON.parse(msg.content.toString());
      console.log(`Received credit rating request for assessment ID: ${content.assessmentId}`);
      
      // Process the credit rating request (simulate processing time)
      console.log('Processing credit rating request...');
      await processRequest(content);
      
      // Acknowledge the message
      channel.ack(msg);
    } catch (error) {
      console.error('Error processing message:', error);
      // Negative acknowledge in case of error
      channel.nack(msg, false, false);
    }
  });
}

async function processRequest(data) {
  // Simulate processing time (1-2 seconds)
  const processingTime = 1000 + Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  // Generate credit score
  const score = generateCreditScore(data);
  
  // Prepare completion message
  const completionMessage = {
    assessmentId: data.assessmentId,
    status: 'COMPLETED',
    score
  };
  
  // Publish completion message
  await publishCompletionMessage(completionMessage);
  
  console.log(`Credit rating completed for assessment ID: ${data.assessmentId}`);
}

async function publishCompletionMessage(data) {
  if (!channel) {
    console.error('AMQP channel not available');
    return;
  }
  
  try {
    const message = Buffer.from(JSON.stringify(data));
    channel.publish(EXCHANGE, COMPLETION_ROUTING_KEY, message, {
      persistent: true
    });
    
    console.log(`Completion message published for assessment ID: ${data.assessmentId}`);
  } catch (error) {
    console.error('Failed to publish completion message:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  if (channel) await channel.close();
  if (connection) await connection.close();
  process.exit(0);
});

// Start the service
async function start() {
  console.log('Starting Buro de Credito service...');
  await setupAmqp();
  await startConsumer();

  console.log('Buro de Credito service is running');
}

start().catch(error => {
  console.error('Failed to start service:', error);
  process.exit(1);
});
