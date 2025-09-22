# Caja Popular Credit Rating System

An internal web application for Caja Popular analysts to request customer credit reports. The system features real-time updates via WebSockets, a modern UI built with Next.js and shadcn/ui, and a microservice architecture for credit rating processing.

## Project Structure

The project is organized into three main directories:

- `frontend/`: Next.js application with TypeScript and App Router
- `backend/`: Node.js server with Fastify, WebSockets, and AMQP integration
- `buro-credito/`: Microservice for credit score processing

## Features

- Fake login system (client-side only for demo purposes)
- Credit request form with validation
- Real-time status updates via WebSockets
- Microservice architecture with AMQP message queuing
- Dedicated credit scoring service (Buro de Credito)
- Modern UI with shadcn/ui components

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- RabbitMQ (included in Docker Compose setup)

## Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- RabbitMQ Management UI: http://localhost:15672 (guest/guest)

## Usage

1. Open http://localhost:3000 in your browser
2. Log in with any email and password (fake authentication)
3. Submit credit rating requests using the form
4. View real-time status updates in the status panel

## API Endpoints

- `POST /api/credit-rating/assessments`: Submit a new credit rating request
- `GET /health`: Health check endpoint

## Messaging Architecture

### Exchange
- `credit-rating.x` (type: topic)

### Queues & Routing Keys
- Requests queue: `credit-rating.requested.q` with key `credit-rating.requested`
- Results queue: `credit-rating.completed.q` with key `credit-rating.completed`

### Message Flow
1. Caja backend (HTTP handler) publishes command to `credit-rating.requested`
2. Buro Stub consumes request, processes it (1-2s), then publishes event to `credit-rating.completed`
3. Caja backend (subscriber) consumes completion event, updates DB/in-memory store, and pushes WebSocket message to the client

## WebSocket Events

The WebSocket server sends the following events:

- Connection confirmation
- Assessment status updates (PENDING, COMPLETED, FAILED)
- Credit score results when an assessment is completed

## Development Notes

- Credit scoring is handled by the Buro de Credito microservice
- No actual authentication is implemented (client-side only)
- AMQP connections are required for proper functionality
- Docker volumes are configured for live code reloading during development


## License

This project is for internal use only.
