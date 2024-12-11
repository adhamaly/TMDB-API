# Stage 1: Build the NestJS application
FROM node:18 AS build

WORKDIR /usr/src/app

# Copy only package.json and package-lock.json
COPY package*.json ./
RUN npm install

# Copy the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package.json and install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy build output from Stage 1
COPY --from=build /usr/src/app/dist ./dist

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main.js"]
