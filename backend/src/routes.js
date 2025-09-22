import { publishCreditRatingRequest } from './amqp.js';
import { notifyClients } from './websocket.js';

export function setupRoutes(fastify) {
  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  // Credit rating assessment endpoint
  fastify.post('/api/credit-rating/assessments', async (request, reply) => {
    const { 
      fullName, 
      dateOfBirth, 
      curp, 
      addressLine1, 
      city, 
      state, 
      postalCode, 
      purpose 
    } = request.body;

    // Validate required fields
    if (!fullName || !dateOfBirth || !curp || !addressLine1 || !city || !state || !postalCode || !purpose) {
      reply.code(400);
      return { error: 'All fields are required' };
    }

    // Generate a unique assessment ID
    const assessmentId = `CR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create initial assessment status
    const assessment = {
      assessmentId,
      status: 'PENDING'
    };

    // Publish request to AMQP for processing
    await publishCreditRatingRequest({
      assessmentId,
      ...request.body
    });

    // Notify connected clients about the new assessment
    notifyClients({
      assessmentId,
      status: 'PENDING'
    });
    
    // The Buro de Credito service will process this request
    // and publish a completion message that we'll receive via AMQP

    return assessment;
  });
}
