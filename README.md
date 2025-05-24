
# Food Delivery Microservices Project
This project is a demonstration of a microservices architecture for a food delivery platform, showcasing proficiency in modern cloud-native technologies, particularly Docker and Kubernetes.

## Description
The project implements key functionalities of a food delivery service through a set of independent, interconnected microservices. Each service is designed to handle a specific domain (e.g., authentication, orders, restaurants, delivery, payments, notifications) and communicates with other services primarily through REST APIs. This architecture promotes scalability, resilience, and independent development and deployment of individual components.

## Features
- **User Authentication:** Secure user registration and login.
- **Restaurant Management:** Add, view, and manage restaurants and their menus.
- **Order Processing:** Users can browse menus, add items to a cart, and place orders.
- **Payment Integration:** Simulate payment processing for orders.
- **Delivery Management:** Assign and track deliveries.
- **Notifications:** Send notifications for order updates (e.g., confirmation, delivery status).
- **API Gateway:** Single entry point for all client requests, routing to the appropriate microservices.
- **Containerization:** Each service is containerized using Docker.
- **Orchestration:** Deployment and management of microservices using Kubernetes.


## Technologies Used
- **Node.js/Express:** Backend development framework for all microservices.
- **React:** Frontend framework for the client application.
- **MongoDB:** Database for storing application data.
- **Docker:** Containerization of all services for consistent environments.
- **Kubernetes:** Orchestration of containers for deployment, scaling, and management.
- **API Gateway:** Centralized entry point for managing requests.
- **Nodemailer/Twilio:** For email and SMS notifications.
- **Stripe (Simulated):** For payment processing.
- **Cloudinary (Simulated):** For image uploads (e.g., restaurant logos, menu items).
- 
## Project Structure
The project is organized into several directories, reflecting the microservice architecture:

## Running the Project with Docker
This project is composed of multiple Node.js services and a client app, all containerized for easy development and deployment. 
Each service uses Node.js version `22.13.1-slim` as specified in the Dockerfiles. 
MongoDB is required and provided as a service in the Docker Compose setup.
