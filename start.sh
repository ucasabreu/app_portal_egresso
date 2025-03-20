#!/bin/bash

docker-compose down

# Build backend image
docker build -t backend-egressos:latest ./backend

# Build frontend image
docker build -t frontend-egressos:latest ./frontend

# Start environment
docker-compose up --build --force-recreate --remove-orphans -d
