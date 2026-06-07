## What this PR does
<!-- One line describing the change -->

## Related task
<!-- Link or task number in Trello -->

## Type of change
- [ ] Frontend
- [ ] Backend
- [ ] Full-stack
- [ ] Docs/Config

## Checklist
- [ ] `npm run build` passed without errors
- [ ] Unit tests passing (`pytest src/tests/unit/ --cov=src/controllers --cov-fail-under=100`)
- [ ] CLAUDE.md guardrails respected (no DELETE SQL, no secrets, no unsolicited refactoring)
- [ ] If backend: new controller has 100% coverage in `src/tests/unit/`
- [ ] If frontend: mockup read before implementing, types imported from `clinica.ts`
- [ ] CLAUDE.md updated if a new architectural decision was made
