docker-compose down

#build backend image
docker build -t backend-egressos:latest ./backend

#build frontend image
docker build -t frontend-egressos:latest ./frontend

#start enviorment
docker-compose up --build --force-recreate --remove-orphans