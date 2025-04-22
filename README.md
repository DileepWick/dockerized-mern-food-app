[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/xIbq4TFL)

## Running the Project with Docker

This project uses Docker Compose to run all services together. Each service is containerized with its own Dockerfile and specific requirements.

### Requirements
- Docker and Docker Compose installed
- Node.js version 22.13.1 is used in all service containers (set via `NODE_VERSION` build arg)
- MongoDB is required and provided as a service in the compose file

### Environment Variables
- Each backend service (`Auth_Service`, `products_services`) requires its own `.env` file (not included in the image; must be present in the respective service directory)
- The `env_file` directive in the compose file loads these automatically

### Build and Run
1. Ensure `.env` files exist in `./Auth_Service` and `./products_services` directories
2. From the project root, run:
   ```sh
   docker compose up --build
   ```
   This will build and start all services.

### Service Ports
- **Auth_Service**: Exposes port `3000`
- **products_services**: Exposes port `5002`
- **Client**: Exposes port `4173` (Vite preview server)
- **MongoDB**: Exposes port `27017` for local development

### Special Configuration
- All services run as non-root users inside containers
- MongoDB data is not persisted by default; uncomment the `volumes` section in `docker-compose.yml` to enable persistence
- `.env` files and other secrets are not copied into images; provide them at runtime

### Inter-Service Networking
- All services are connected via a shared `backend` Docker network for internal communication

---
