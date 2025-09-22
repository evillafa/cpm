FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install for development)
RUN npm install

# Expose the port the app runs on
EXPOSE 3001

# Set environment variables
ENV PORT=3001
ENV NODE_ENV=development
ENV AMQP_URL=amqp://rabbitmq

# Command to run the application with nodemon for hot-reloading
CMD ["npm", "run", "dev"]
