## Atendimentos (Evoluir) — comandos de desenvolvimento
##
## Uso comum:
##   make dev        sobe backend + frontend em background (mata qualquer instância antiga primeiro)
##   make stop       derruba tudo que foi subido por este Makefile (e qualquer processo solto nas portas)
##   make status     mostra o que está rodando nas portas do backend/frontend
##   make logs       acompanha os logs do backend e frontend em tempo real

BACKEND_PORT ?= 8000
FRONTEND_PORT ?= 5175
PIDDIR := .pids
LOGDIR := .logs

.PHONY: help install backend frontend dev stop status logs seed seed-reset build lint test check clean-db

help:
	@grep -E '^##' Makefile | sed 's/^## \{0,1\}//'

## --- Setup ---

install: ## Instala dependências de backend e frontend
	uv sync --group dev
	cd frontend && npm install

## --- Rodar em desenvolvimento ---

$(PIDDIR) $(LOGDIR):
	mkdir -p $@

backend: $(PIDDIR) $(LOGDIR) ## Sobe só o backend (mata instância antiga na porta primeiro)
	@echo "Derrubando qualquer processo na porta $(BACKEND_PORT)..."
	@lsof -ti:$(BACKEND_PORT) 2>/dev/null | xargs -r kill -9
	@sleep 1
	uv run uvicorn src.main:app --reload --port $(BACKEND_PORT) --log-level info 2>&1 | tee $(LOGDIR)/backend.log

frontend: $(PIDDIR) $(LOGDIR) ## Sobe só o frontend (mata instância antiga na porta primeiro)
	@echo "Derrubando qualquer processo na porta $(FRONTEND_PORT)..."
	@lsof -ti:$(FRONTEND_PORT) 2>/dev/null | xargs -r kill -9
	@sleep 1
	cd frontend && npm run dev -- --port $(FRONTEND_PORT) 2>&1 | tee ../$(LOGDIR)/frontend.log

dev: $(PIDDIR) $(LOGDIR) ## Sobe backend + frontend em background (mata instâncias antigas primeiro)
	@$(MAKE) stop
	@echo "Subindo backend na porta $(BACKEND_PORT)..."
	@nohup uv run uvicorn src.main:app --reload --port $(BACKEND_PORT) > $(LOGDIR)/backend.log 2>&1 & echo $$! > $(PIDDIR)/backend.pid
	@echo "Subindo frontend na porta $(FRONTEND_PORT)..."
	@cd frontend && (nohup npm run dev -- --port $(FRONTEND_PORT) > ../$(LOGDIR)/frontend.log 2>&1 & echo $$! > ../$(PIDDIR)/frontend.pid)
	@sleep 2
	@$(MAKE) status
	@echo ""
	@echo "Backend:  http://127.0.0.1:$(BACKEND_PORT)  (docs em /docs)"
	@echo "Frontend: veja a URL exata em '$(LOGDIR)/frontend.log' (ex: http://localhost:$(FRONTEND_PORT)/static/dist/)"
	@echo "Logs:     make logs"
	@echo "Parar:    make stop"

stop: ## Derruba tudo (pelos PIDs salvos e por qualquer processo solto nas portas)
	@if [ -f $(PIDDIR)/backend.pid ]; then kill -9 $$(cat $(PIDDIR)/backend.pid) 2>/dev/null || true; rm -f $(PIDDIR)/backend.pid; fi
	@if [ -f $(PIDDIR)/frontend.pid ]; then kill -9 $$(cat $(PIDDIR)/frontend.pid) 2>/dev/null || true; rm -f $(PIDDIR)/frontend.pid; fi
	@lsof -ti:$(BACKEND_PORT) 2>/dev/null | xargs -r kill -9
	@lsof -ti:$(FRONTEND_PORT) 2>/dev/null | xargs -r kill -9
	@echo "Parado."

status: ## Mostra o que está rodando nas portas do backend/frontend
	@echo "--- porta $(BACKEND_PORT) (backend) ---"
	@lsof -i:$(BACKEND_PORT) 2>/dev/null || echo "(nada rodando)"
	@echo "--- porta $(FRONTEND_PORT) (frontend) ---"
	@lsof -i:$(FRONTEND_PORT) 2>/dev/null || echo "(nada rodando)"

logs: ## Acompanha os logs do backend e frontend (Ctrl+C para sair)
	@tail -f $(LOGDIR)/backend.log $(LOGDIR)/frontend.log

## --- Banco de dados de desenvolvimento ---

seed: ## Popula o app.db local com histórico clínico de exemplo (idempotente)
	uv run python scripts/seed_dev_data.py

seed-reset: ## Recria os dados seedados do zero
	uv run python scripts/seed_dev_data.py --reset

clean-db: ## Remove o app.db local (próxima subida do backend recria as tabelas vazias)
	rm -f app.db
	@echo "app.db removido."

## --- Qualidade ---

build: ## Build de produção do frontend
	cd frontend && npm run build

lint: ## Lint do backend (ruff)
	uv run ruff check src/

test: ## Testes do backend com cobertura de controllers
	uv run pytest src/tests/unit/ --cov=src/controllers --cov-fail-under=100

check: lint test build ## Roda lint + testes + build (o que o CI verifica)
