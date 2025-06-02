# Use Node.js LTS base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Ensure DATABASE_URL is set before running generate (if needed)
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN echo "DATABASE_URL=$DATABASE_URL" > .env

# Generate Prisma client (if applicable)
RUN npm run prisma:generate

# Build the TypeScript code
RUN npm run build

# Expose the port your app uses (optional; change if needed)
EXPOSE 4000

# Run the app
CMD ["node", "dist/index.js"]
