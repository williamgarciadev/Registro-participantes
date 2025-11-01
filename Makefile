.PHONY: help install dev-backend dev-frontend test build deploy clean

help:
	@echo "Comandos disponibles:"
	@echo "  make install        - Instalar dependencias (backend y frontend)"
	@echo "  make dev-backend    - Iniciar backend en modo desarrollo"
	@echo "  make dev-frontend   - Iniciar frontend en modo desarrollo"
	@echo "  make dev            - Iniciar backend y frontend (requiere tmux)"
	@echo "  make test           - Ejecutar tests"
	@echo "  make build          - Construir aplicación para producción"
	@echo "  make deploy         - Desplegar a AWS"
	@echo "  make clean          - Limpiar archivos temporales"

install:
	@echo "📦 Instalando dependencias del backend..."
	cd backend && python -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	@echo "📦 Instalando dependencias del frontend..."
	cd frontend && npm install
	@echo "✅ Dependencias instaladas"

dev-backend:
	@echo "🚀 Iniciando backend en modo desarrollo..."
	cd backend && docker-compose up -d postgres
	@echo "⏳ Esperando a que PostgreSQL esté listo..."
	sleep 5
	cd backend && . venv/bin/activate && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@echo "🚀 Iniciando frontend en modo desarrollo..."
	cd frontend && npm run dev

dev:
	@echo "🚀 Iniciando aplicación completa..."
	@which tmux > /dev/null || (echo "❌ tmux no está instalado. Instálalo con: brew install tmux" && exit 1)
	tmux new-session -d -s registro 'cd backend && docker-compose up'
	tmux split-window -h -t registro 'sleep 10 && cd backend && . venv/bin/activate && uvicorn src.main:app --reload'
	tmux split-window -v -t registro 'cd frontend && npm run dev'
	tmux attach -t registro

test:
	@echo "🧪 Ejecutando tests del backend..."
	cd backend && . venv/bin/activate && pytest
	@echo "✅ Tests completados"

build:
	@echo "📦 Construyendo backend..."
	sam build
	@echo "📦 Construyendo frontend..."
	cd frontend && npm run build
	@echo "✅ Build completado"

deploy:
	@echo "🚀 Desplegando a AWS..."
	./deploy.sh

clean:
	@echo "🧹 Limpiando archivos temporales..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	cd frontend && rm -rf dist node_modules/.vite 2>/dev/null || true
	rm -rf .aws-sam 2>/dev/null || true
	@echo "✅ Limpieza completada"

db-migrate:
	@echo "🔄 Ejecutando migraciones..."
	cd backend && . venv/bin/activate && alembic upgrade head
	@echo "✅ Migraciones aplicadas"

db-migration:
	@echo "📝 Creando nueva migración..."
	@read -p "Nombre de la migración: " name; \
	cd backend && . venv/bin/activate && alembic revision --autogenerate -m "$$name"

logs:
	@echo "📋 Mostrando logs de Lambda..."
	sam logs -n FastAPIFunction --stack-name registro-participantes-dev --tail

docker-up:
	@echo "🐳 Iniciando servicios con Docker Compose..."
	cd backend && docker-compose up -d

docker-down:
	@echo "🐳 Deteniendo servicios de Docker Compose..."
	cd backend && docker-compose down

docker-logs:
	@echo "📋 Mostrando logs de Docker..."
	cd backend && docker-compose logs -f
