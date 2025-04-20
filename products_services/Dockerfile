# Use an official Node.js runtime as the base image
FROM node:20-alpine
    
# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 5001

# Define the command to run the application
CMD ["npm", "run", "dev"]
