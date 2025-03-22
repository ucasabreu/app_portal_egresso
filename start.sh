#!/bin/bash

echo "🔄 Parando containers antigos..."
docker-compose down -v

echo "🐳 Buildando imagem do BACKEND..."
docker build -t backend-egressos:latest ./backend || { echo "❌ Erro ao buildar o backend"; exit 1; }

echo "🐳 Buildando imagem do FRONTEND..."
docker build -t frontend-egressos:latest ./frontend || { echo "❌ Erro ao buildar o frontend"; exit 1; }

echo "🚀 Subindo ambiente Docker..."
docker-compose up --build --force-recreate --remove-orphans -d || { echo "❌ Erro ao subir o ambiente"; exit 1; }

echo "✅ Ambiente rodando! Use 'docker-compose ps' para verificar."
