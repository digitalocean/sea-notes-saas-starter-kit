```markdown
# Contributors & How to Contribute

Thank you for your interest in contributing to Sea Notes — your contributions make this project better for everyone.

## Quick start
1. Fork the repo and create a feature branch from `main`:
   - git checkout -b feat/short-description
2. Follow the repo's coding style and TypeScript/Next.js conventions.
3. Commit with clear messages (use Conventional Commits if possible).
4. Open a Pull Request referencing the issue (or create one) and add a short description of your changes.

## What to work on
- Small/tasks for first contributions:
  - Docs: README, CONTRIBUTING, local dev guides
  - Tests: unit / integration tests
  - Dependency updates (dependabot PRs)
- Medium/Large:
  - Authentication flows (OAuth, sign-up)
  - AI features (summaries, Q&A, GradientAI migration)
  - Vector/semantic search and ephemeral index work

## PR checklist (please ensure before requesting review)
- [ ] Branch from up-to-date `main`
- [ ] Link the PR to an issue or clearly describe the problem it solves
- [ ] Run lint and tests locally: `npm install && npm run lint && npm test`
- [ ] Update or add tests for new behavior
- [ ] Update README or docs for any user-facing change
- [ ] Add notes about required environment variables to `.env.example` if applicable

## Code style & tests
- Keep code modular and server/client boundaries clear (Next.js app rules).
- Prefer type-safe changes and add TypeScript types where missing.
- Run the test suite and include tests for bug fixes and new features.

## Communication & etiquette
- If you plan to work on an issue, leave a comment to indicate you’re taking it.
- For larger changes, open a draft PR early so maintainers can give feedback.
- Be respectful and follow the project's Code of Conduct (see LICENSE and repository docs).

## Maintainers
- Core maintainers review PRs and merge when checks pass. If your PR needs review and is blocked, tag maintainers or open an issue to request help.

## License
By contributing you agree that your contributions will be licensed under the project’s MIT License.

Thank you again — we appreciate your help!
```
