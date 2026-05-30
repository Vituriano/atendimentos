# CLAUDE.md — Guia de Padrões para Agentes Claude

Este arquivo é lido automaticamente pelo Claude Code em toda sessão. Contém as regras, padrões e guardrails do projeto. Mantenha-o atualizado a cada decisão arquitetural relevante.

---

## 1. Contexto do Projeto

Sistema de gestão clínica pediátrica para o HC/UFPE. Digitaliza o fluxo de consultas para reduzir o tempo de atendimento de 90-120min para 35-45min.

- **Domínio clínico**: Fila, Briefing, Formulário de Consulta (Anamnese, Exame Físico, Marcos do Desenvolvimento, M-CHAT-R), Caderneta Digital, Dashboard, Integração AGHU
- **Status**: Phase 1 concluída (auth + provider pattern + esqueleto frontend). Phases 2-5 pendentes.
- **Referências**: `docs/docs/01-visao.md`, `docs/docs/SPEC.md`

---

## 2. Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | FastAPI 0.121 · SQLAlchemy 2.0 · Alembic · ldap3 · PyJWT · Python ≥3.13 |
| Frontend | Vue 3 · Pinia · Vite · TypeScript · Tailwind CSS 4 · Axios · Zod · vee-validate |
| DB Produção | PostgreSQL via asyncpg (dados AGHU) |
| DB Desenvolvimento | SQLite via aiosqlite |
| Migrações | Alembic (diretório `alembic/`) |

Referência completa: `docs/docs/06-arquitetura.md`

---

## 3. Arquitetura

O fluxo obrigatório de toda feature de backend é:

```
Router → Controller → Provider → Resource → Database
```

- **Router** (`src/routers/`): endpoints FastAPI, validação Pydantic, auth via `Depends`. Declara `STRATEGY` no topo como único ponto de configuração da fonte de dados.
- **Controller** (`src/controllers/`): lógica de negócio e orquestração. Nunca importa um provider concreto — só a interface.
- **Provider** (`src/providers/`): acesso a dados. Interface em `src/providers/interfaces/`, implementações em `src/providers/implementations/`.
- **Resource** (`src/resources/`): gerenciamento de conexões e sessões.
- **Factory** (`src/dependencies.py`): retorna o provider correto com base no `STRATEGY`.

Referências: `docs/ARCHITECTURE.md`, `docs/GUIA_DESENVOLVIMENTO.md`

---

## 4. Fluxo de Implementação (novo domínio)

Ao implementar um domínio novo (ex: `consulta`, `alerta`, `dashboard`), seguir esta ordem:

1. SQL template em `src/providers/sql/<dominio>/`
2. Interface do provider em `src/providers/interfaces/<dominio>_provider_interface.py`
3. Implementação(ões) em `src/providers/implementations/<dominio>_<tipo>_provider.py`
4. Factory em `src/dependencies.py`
5. Controller em `src/controllers/<dominio>_controller.py`
6. Router em `src/routers/<dominio>.py` + registrar no `src/main.py`
7. Pinia store em `frontend/src/stores/<dominio>.ts`
8. View em `frontend/src/views/<Dominio>.vue` + rota em `frontend/src/router/index.ts`

Referência detalhada: `docs/GUIA_DESENVOLVIMENTO.md`

---

## 5. Guardrails — NUNCA violar

Estas regras são inegociáveis. Não há exceções sem instrução explícita do usuário.

- **Soft delete obrigatório**: nunca executar `DELETE` SQL. Sempre marcar `deleted_at = NOW()`. Queries filtram `deleted_at IS NULL`.
- **Sem secrets no código**: toda configuração sensível vai em `.env`. Nunca hardcodar URLs, credenciais, chaves JWT ou DSNs.
- **Sem refatoração não solicitada**: não reestruturar, renomear ou reorganizar código existente sem instrução explícita. Bug fix não autoriza cleanup ao redor.
- **Milestones e M-CHAT-R são imutáveis sem instrução clínica**: os checklists de desenvolvimento e M-CHAT-R são protocolos clínicos versionados em código. Alterar exige instrução explícita com justificativa clínica.
- **`origemDescricao` é obrigatório em dados externos**: qualquer dado externo ao sistema deve registrar a origem (compliance LGPD/auditoria).

---

## 6. Convenções de Naming

**Backend (Python)**
- Funções e variáveis: `snake_case`
- Classes: `PascalCase`
- Interfaces: sufixo `Interface` (ex: `PacienteProviderInterface`)
- Arquivos: `snake_case.py`
- Modelos SQLAlchemy: singular (ex: `RefreshToken`)

**Frontend (TypeScript/Vue)**
- Funções e variáveis: `camelCase`
- Componentes e stores: `PascalCase`
- Arquivos de componentes: `PascalCase.vue`
- Arquivos de stores/services/utils: `camelCase.ts`
- Stores Pinia: prefixo `use` (ex: `useAuthStore`)

**Git**
- Prefixos de commit em português: `feat:`, `fix:`, `docs:`, `style:`, `chore:`, `add:`
- Branches: `feat/nome-da-feature`, `fix/nome-do-bug`, `docs/nome`

---

## 7. Autenticação

- **Dual-mode automático**: se `AD_URL` está definida no `.env`, usa `ActiveDirectoryAuthProvider` (LDAP/AD). Se ausente, usa `MockAuthProvider` (desenvolvimento offline).
- **Tokens**: JWT (15min, access) + Refresh Token HttpOnly (30 dias, persistido em SQLite no `app.db`).
- **RBAC**: 4 papéis mapeados dos grupos AD (`médico_hc`, `médico_satélite`, `recepção`, `gestão`). Admin: grupo `GLO-SEC-HCPE-SETISD`.
- **Mock credentials**: `admin / admin` (inclui grupo admin para testes locais).

Referência: `docs/AUTHENTICATION.md`

---

## 8. ADRs — Decisões Arquiteturais Registradas

Toda decisão arquitetural relevante deve ter um ADR em `docs/decisions/`. Formato: Michael Nygard (ADR-001 define o template).

| ADR | Decisão |
|-----|---------|
| ADR-001 | Formato Nygard adotado para ADRs |
| ADR-002 | Integração AGHU via copy-paste estruturado (API indisponível) |
| ADR-003 | Persistência local (PostgreSQL/SQLite) + sincronização assíncrona com AGHU |
| ADR-004 | Milestones e M-CHAT-R definidos estaticamente em código |

---

## 9. Checklist de Fechamento (obrigatório a cada feature/PR)

Antes de considerar uma tarefa concluída, verificar:

- [ ] Os 5 guardrails da Seção 5 foram respeitados?
- [ ] Nova decisão arquitetural tomada? → Criar ADR em `docs/decisions/`
- [ ] Este `CLAUDE.md` precisa de atualização (novo padrão, nova convenção, novo guardrail)?
- [ ] Documentação afetada foi atualizada? (`docs/ARCHITECTURE.md`, `docs/GUIA_DESENVOLVIMENTO.md`, specs relevantes)

---

*Atualizar este arquivo sempre que um novo padrão for estabelecido ou uma decisão arquitetural relevante for tomada.*
