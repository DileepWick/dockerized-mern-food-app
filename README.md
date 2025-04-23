[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/xIbq4TFL)

## Running the Project with Docker

This project is composed of multiple Node.js services and a client app, all containerized for easy development and deployment. Each service uses Node.js version `22.13.1-slim` as specified in the Dockerfiles. MongoDB is required and provided as a service in the Docker Compose setup.

### Requirements
- Docker and Docker Compose installed
- `.env` files for each backend service (`RestaurantService`, `auth_service`, `order_services`, `products_services`) with the required environment variables (see each service's `.env` file for details)

### Build and Run

To build and start all services, run:

```sh
# From the project root directory
docker compose up --build
```

This will build and start the following services:
- **js-restaurantservice** (port 3001)
- **js-auth_service** (port 3002)
- **js-order_services** (port 3003)
- **js-products_services** (port 3004)
- **js-client** (port 4173)
- **mongo** (port 27017)

### Ports
- RestaurantService: [http://localhost:3001](http://localhost:3001)
- Auth Service: [http://localhost:3002](http://localhost:3002)
- Order Services: [http://localhost:3003](http://localhost:3003)
- Products Services: [http://localhost:3004](http://localhost:3004)
- Client: [http://localhost:4173](http://localhost:4173)
- MongoDB: [mongodb://localhost:27017](mongodb://localhost:27017)

### Special Configuration
- **Environment Variables:** Each backend service requires its own `.env` file. These are not included in the Docker images and must be present in the respective service directories before running Docker Compose.
- **.env Security:** `.env` files are excluded from Docker images for security. Do not commit them to version control.
- **MongoDB Data:** MongoDB data is persisted in a Docker volume (`mongo_data`).
- **Network:** All services are connected via a Docker bridge network (`backend`).

### Notes
- If you need to change the exposed ports, update the `ports` section in the `docker-compose.yml` file.
- The client app is served using Vite's preview server on port 4173.
- All backend services depend on MongoDB and will wait for it to be healthy before starting.
