# CLAUDE.md — Guia de Padrões para Agentes Claude

Este arquivo é lido automaticamente pelo Claude Code em toda sessão. Contém as regras, padrões e guardrails do projeto. Mantenha-o atualizado a cada decisão arquitetural relevante.

---

## 0. Session Setup (run automatically at the start of every session)

At the beginning of every session, silently verify and apply the following — no need to report unless something fails:

```bash
# Enable pre-commit lint hook (idempotent — safe to run every session)
git config core.hooksPath .githooks

# Install dev dependencies if not present
uv sync --group dev --quiet
```

If either command fails, report the error and stop — do not proceed with implementation tasks without the lint hook active.

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
- Commit messages in English with conventional prefixes: `feat:`, `fix:`, `docs:`, `style:`, `chore:`
- Branches: `feat/feature-name`, `fix/bug-name`, `docs/name`

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

## 10. Workflow de Implementação Frontend (Mockup → Vue)

O diretório `mockup/` contém o protótipo completo em Next.js/React gerado no v0. Ele é a **fonte de verdade de UX e fluxo** para todas as telas Vue. O visual pode evoluir, mas o fluxo deve ser respeitado.

### Regra fundamental
**Sempre ler o mockup antes de escrever qualquer código Vue.**

### Sequência obrigatória por tela

1. **Ler o mockup** — `mockup/app/<tela>/page.tsx`, componentes usados, `mockup/lib/types.ts`, `mockup/lib/mock-data.ts`
2. **Inventariar o Vue** — verificar `frontend/src/components/`, `stores/`, `views/` antes de criar algo novo
3. **Planejar** — definir quais arquivos criar (view, store, componentes, rota)
4. **Implementar na ordem**: Store com dados mockados → View → Componentes filhos → Rota
5. **Verificar**: `npm run build` sem erros, tela populada com mock data, interações funcionando

### Dados mockados primeiro, API depois
Todas as telas são implementadas primeiro com dados mockados na store Pinia. A task de "conectar ao backend" é sempre separada e posterior — ela apenas troca o mock por chamada Axios.

### Tipos compartilhados
- Tipos do domínio clínico: `frontend/src/types/clinica.ts`
- Store do paciente ativo (contexto entre telas): `frontend/src/stores/paciente.ts`
- **Nunca redefinir tipos localmente** — sempre importar de `clinica.ts`

### Padrão de store Pinia
Composition API style (igual a `auth.ts`):
```typescript
export const useXxxStore = defineStore('xxx', () => {
  const estado = ref<Tipo | null>(null)
  const derivado = computed(() => ...)
  function acao() { ... }
  return { estado, derivado, acao }
})
```

### Ordem de implementação das telas

| Prioridade | Tela | Mockup | View Vue |
|-----------|------|--------|----------|
| 1 | Layout Shell + Sidebar | `components/main-layout.tsx` | `layouts/AppLayout.vue` |
| 2 | Fila de Atendimento | `app/page.tsx` | `views/Fila.vue` |
| 3 | Briefing Clínico | `app/briefing/page.tsx` | `views/Briefing.vue` |
| 4 | Formulário de Consulta | `app/consulta/page.tsx` | `views/Consulta.vue` |
| 5 | Caderneta Digital | `app/caderneta/page.tsx` | `views/Caderneta.vue` |
| 6 | Base de Pacientes (upgrade) | `app/pacientes/page.tsx` | `views/Pacientes.vue` |

### Regra de componentização
Só extrair componente separado se: aparece em mais de uma view **ou** template > 80 linhas.

### Ícones
Usar `@heroicons/vue` (já instalado). Ao traduzir o mockup (Lucide) para Vue, mapear para o equivalente Heroicon. Não instalar lucide-vue-next.

### Roteamento e layout
Rotas autenticadas são **filhas de uma rota pai** que renderiza `AppLayout.vue` (sidebar + `<router-view>`). Login usa `LoginLayout.vue` sem sidebar. Não usar `meta.layout`.

### Estado do paciente ativo
Mantido apenas em memória (`usePacienteStore`). F5 limpa o estado — o router guard redireciona para `/fila` se não houver paciente ativo. Não persistir em localStorage/sessionStorage.

---

## 11. Git e Pull Requests

### Modelo de branching: GitHub Flow
- `main` é a branch protegida. Nunca fazer push direto.
- Toda mudança parte de uma feature branch: `feat/nome`, `fix/nome`, `docs/nome`
- Merge via PR com CI passando + 1 aprovação obrigatória

### Workflow de PR (obrigatório)
Ao concluir uma task, abrir PR usando o template em `.github/pull_request_template.md`:

```bash
gh pr create --title "feat: descrição da task" --body "$(cat .github/pull_request_template.md)"
```

O agente deve preencher o template antes de submeter — não deixar campos em branco.

---

## 12. Testes de Backend

### Padrão obrigatório
- **Tipo**: unitário apenas
- **Camada**: `src/controllers/` — 100% de cobertura obrigatória
- **Bibliotecas**: `pytest` + `pytest-mock` + `pytest-cov`
- **Providers são mockados** nos testes de controller — nunca usar banco real em teste unitário

### Estrutura
```
src/tests/
  unit/
    test_fila_controller.py
    test_consultas_controller.py
    ...
```

### Comando
```bash
pytest src/tests/unit/ --cov=src/controllers --cov-fail-under=100
```

### Regra
Todo novo controller criado deve ter seu `test_<dominio>_controller.py` na mesma PR. CI bloqueia merge se cobertura de `src/controllers/` cair abaixo de 100%.

---

## 13. CI — GitHub Actions

Roda em todo PR para `main`. Deve passar antes de mergear.

**Jobs:**

| Job | Comando | Gate |
|-----|---------|------|
| Frontend build | `npm run build` | Falha = bloqueia |
| Backend lint | `uv run ruff check src/` | Falha = bloqueia |
| Backend testes | `pytest src/tests/unit/ --cov=src/controllers --cov-fail-under=100` | Falha = bloqueia |

Deploy é **manual** — CI não faz deploy.

---

*Atualizar este arquivo sempre que um novo padrão for estabelecido ou uma decisão arquitetural relevante for tomada.*
