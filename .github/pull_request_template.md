## O que essa PR faz
<!-- Uma linha descrevendo a mudança -->

## Task relacionada
<!-- Link ou número da task no Trello -->

## Tipo de mudança
- [ ] Frontend
- [ ] Backend
- [ ] Full-stack
- [ ] Docs/Config

## Checklist
- [ ] `npm run build` passou sem erros
- [ ] Testes unitários passando (`pytest src/tests/unit/ --cov=src/controllers --cov-fail-under=100`)
- [ ] Guardrails do CLAUDE.md respeitados (sem DELETE SQL, sem secrets, sem refatoração não solicitada)
- [ ] Se backend: novo controller tem 100% de cobertura em `src/tests/unit/`
- [ ] Se frontend: mockup lido antes de implementar, tipos importados de `clinica.ts`
- [ ] CLAUDE.md atualizado se nova decisão arquitetural foi tomada
