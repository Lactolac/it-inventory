#!/bin/bash

# Colores para la consola
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando proceso de despliegue...${NC}"

# Frontend
echo -e "${GREEN}📦 Construyendo imagen del Frontend...${NC}"
docker build -t docker-registry.yes.com.sv/it-inv-frontend ./frontend

echo -e "${GREEN}📤 Subiendo imagen del Frontend...${NC}"
docker push docker-registry.yes.com.sv/it-inv-frontend

# Backend
echo -e "${GREEN}📦 Construyendo imagen del Backend...${NC}"
docker build -t docker-registry.yes.com.sv/it-inv:backend ./backend

echo -e "${GREEN}📤 Subiendo imagen del Backend...${NC}"
docker push docker-registry.yes.com.sv/it-inv:backend

echo -e "${BLUE}✅ Proceso finalizado con éxito. Ahora puedes actualizar el stack en Portainer.${NC}"
