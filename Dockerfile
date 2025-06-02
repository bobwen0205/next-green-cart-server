# Use Node.js LTS base image
FROM node:alpine3.18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Generate Prisma client (if applicable)
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Expose the port your app uses (optional; change if needed)
EXPOSE 4000

# Run the app
CMD ["node", "dist/index.js"]
