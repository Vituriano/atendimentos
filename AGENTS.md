# AGENTS.md — Guia para Agentes de IA

Este arquivo orienta agentes de IA (Claude Code e similares) sobre como trabalhar neste projeto. Leia antes de qualquer implementação.

---

## Visão Geral do Projeto

Sistema de gestão clínica pediátrica para o HC/UFPE. Stack: FastAPI + Vue 3 + SQLite/PostgreSQL.

Leia o `CLAUDE.md` para regras completas de arquitetura, guardrails e convenções.

---

## Como Trabalhar Neste Projeto

### Antes de qualquer implementação

1. Leia o `CLAUDE.md` completo
2. Leia a task que você recebeu com atenção
3. Verifique os arquivos existentes antes de criar novos (`frontend/src/`, `src/`)
4. Se a task for de frontend: **leia o mockup primeiro** (ver Seção abaixo)

### Nunca faça sem instrução explícita

- Refatorar código existente não relacionado à task
- Criar abstrações ou helpers "para uso futuro"
- Executar `DELETE` SQL — use soft delete (`deleted_at = NOW()`)
- Alterar os protocolos clínicos: marcos de desenvolvimento (`src/data/marcos-desenvolvimento.ts`) e M-CHAT-R (`src/data/mchat-perguntas.ts`)
- Hardcodar secrets, URLs ou credenciais

---

## Workflow de Frontend (Mockup → Vue)

### O mockup é a fonte de verdade de UX

O diretório `mockup/` contém o protótipo completo em Next.js/React. Ele define layout, fluxo e interações de cada tela. O visual pode evoluir, mas o fluxo deve ser respeitado.

### Sequência obrigatória por tela

**Passo 1 — Ler o mockup da tela**

Antes de escrever qualquer Vue, leia:
- `mockup/app/<tela>/page.tsx` — estrutura e interações
- Componentes usados: `mockup/components/<nome>.tsx`
- `mockup/lib/types.ts` — modelos de dados
- `mockup/lib/mock-data.ts` — exemplos de dados reais

Extraia: quais seções existem, quais dados são exibidos, quais interações o usuário pode fazer.

**Passo 2 — Inventariar o Vue existente**

Verifique antes de criar:
- `frontend/src/components/` — componentes reutilizáveis
- `frontend/src/stores/` — stores Pinia existentes
- `frontend/src/types/clinica.ts` — tipos do domínio (nunca redefina localmente)
- `frontend/src/views/` — views já implementadas

**Passo 3 — Implementar na ordem correta**

```
Store Pinia (com mock data) → View → Componentes filhos → Rota
```

Nunca inverter essa ordem. A store deve existir antes da view.

**Passo 4 — Verificar**

```bash
cd frontend && npm run build   # zero erros
```

Navegue até a rota e confirme: tela populada com dados mockados, interações funcionando.

### Regras de implementação frontend

- **Tipos**: sempre importar de `frontend/src/types/clinica.ts`. Nunca criar tipos locais para domínio clínico.
- **Store do paciente ativo**: usar `usePacienteStore` de `frontend/src/stores/paciente.ts`. Não duplicar esse estado.
- **Mock data primeiro**: implementar com dados mockados na store. A integração com API é uma task separada.
- **Componentização**: só extrair componente separado se aparecer em >1 view ou tiver >80 linhas de template.
- **Sem `any`**: todas as stores e componentes devem ser tipados.
- **Ícones**: usar `@heroicons/vue`. Não instalar lucide-vue-next. Mapear ícones Lucide do mockup para equivalentes Heroicon.
- **Layout**: rotas autenticadas são filhas de uma rota pai com `AppLayout.vue`. Não usar `meta.layout`.
- **Estado do paciente**: apenas em memória. F5 limpa — router guard redireciona para `/fila`.

---

## Workflow de Backend (novo domínio)

Seguir sempre esta ordem:

```
Migrations (Alembic) →
SQL templates (src/providers/sql/<dominio>/) →
Interface (src/providers/interfaces/<dominio>_provider_interface.py) →
Implementação SQLite (src/providers/implementations/<dominio>_sqlite_provider.py) →
Factory (src/dependencies.py) →
Controller (src/controllers/<dominio>_controller.py) →
Router (src/routers/<dominio>.py) → registrar em src/main.py
```

### Regras de backend

- Declarar `STRATEGY` no topo de cada router como único ponto de configuração da fonte de dados
- Controller nunca importa provider concreto — só a interface
- Soft delete em todas as tabelas: `created_at`, `updated_at`, `deleted_at`
- `origemDescricao` obrigatório em dados externos (LGPD/auditoria)
- Testar via Swagger em `/docs` após implementar
- **Todo novo controller exige `test_<dominio>_controller.py` na mesma PR** — sem exceção

---

## Fluxo de Dados Entre Telas

O paciente selecionado na Fila flui por todas as telas via `usePacienteStore`:

```
Fila → selecionarPaciente(paciente, 'consulta') → Briefing → Consulta → Finalização
Base de Pacientes → selecionarPaciente(paciente, 'leitura') → Briefing (modo leitura)
```

- `modoLeitura = true`: Briefing exibe banner, oculta botão "Iniciar Atendimento"
- `limparPaciente()`: chamado ao finalizar consulta ou sair do fluxo

---

## Arquivos de Referência Rápida

| O que você precisa | Onde encontrar |
|--------------------|---------------|
| Tipos do domínio clínico | `frontend/src/types/clinica.ts` |
| Store do paciente ativo | `frontend/src/stores/paciente.ts` |
| Mockup de qualquer tela | `mockup/app/<tela>/page.tsx` |
| Dados mockados do domínio | `mockup/lib/mock-data.ts` |
| Padrão de store Pinia | `frontend/src/stores/auth.ts` |
| Padrão de provider backend | `src/providers/implementations/` |
| Guardrails e convenções | `CLAUDE.md` |
| Decisões arquiteturais | `docs/decisions/` |

---

## Testes Unitários de Backend

### Padrão obrigatório
- Testar apenas `src/controllers/` — 100% de cobertura obrigatória
- Providers são **sempre mockados** com `pytest-mock` — nunca usar banco real
- Um arquivo de teste por controller: `src/tests/unit/test_<dominio>_controller.py`

### Exemplo de estrutura
```python
def test_listar_fila_retorna_pacientes(mocker):
    mock_provider = mocker.Mock()
    mock_provider.listar.return_value = [...]
    controller = FilaController(provider=mock_provider)
    resultado = controller.listar()
    assert len(resultado) > 0
```

### Comando local
```bash
pytest src/tests/unit/ --cov=src/controllers --cov-fail-under=100
```

---

## Git e Pull Requests

### Setup local (run once after cloning)

```bash
git config core.hooksPath .githooks
uv sync --group dev
```

This enables the pre-commit hook that runs `ruff` before every commit.

### Branches
- `main` is protected — never push directly
- Feature branches: `feat/name`, `fix/name`, `docs/name`
- Merge via PR with CI passing + 1 approval

### Commit messages
- **English only**
- Conventional prefixes: `feat:`, `fix:`, `docs:`, `style:`, `chore:`
- Example: `feat: add queue view with mock data`

### Open a PR (required)
When the task is done, open a PR with the filled template:

```bash
gh pr create --title "feat: description" --body "$(cat .github/pull_request_template.md)"
```

**Fill all fields in the template before submitting.** No empty checkboxes.

---

## CI — O que roda em cada PR

| Job | Comando | Bloqueia merge? |
|-----|---------|----------------|
| Frontend build | `npm run build` | Sim |
| Backend lint | `uv run ruff check src/` | Sim |
| Backend testes | `pytest src/tests/unit/ --cov=src/controllers --cov-fail-under=100` | Sim |

Deploy é **manual** — CI não faz deploy.

---

## Checklist por Task

Antes de declarar uma task concluída:

**Frontend:**
- [ ] Mockup lido antes de escrever código
- [ ] Tipos importados de `clinica.ts` (sem `any`, sem tipos locais)
- [ ] Store com mock data funcional
- [ ] Rota registrada e acessível
- [ ] `npm run build` sem erros
- [ ] PR aberto com template preenchido

**Backend:**
- [ ] Migration criada com `deleted_at`
- [ ] Provider interface definida
- [ ] `STRATEGY` declarado no router
- [ ] Testado via Swagger (`/docs`)
- [ ] Sem `DELETE` SQL
- [ ] `test_<dominio>_controller.py` criado com 100% de cobertura
- [ ] PR aberto com template preenchido

**Ambos:**
- [ ] Guardrails do `CLAUDE.md` respeitados
- [ ] Sem secrets hardcoded
- [ ] Sem refatoração não solicitada
- [ ] CI passando antes de pedir review
