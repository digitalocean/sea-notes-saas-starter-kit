# Contributing to SeaNotes

Thank you for your interest in contributing to SeaNotes! This document provides guidelines and information for contributors to help make the contribution process smooth and effective.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Documentation](#documentation)
- [Community Guidelines](#community-guidelines)

## Getting Started

Before contributing, please:

1. **Read the README.md** - Understand what SeaNotes is and how it works
2. **Check existing issues** - Your idea might already be discussed or in progress
3. **Comment on issues to get assigned** - To contribute, you must comment on existing issues to get assigned to them. If you want to work on a new feature or bug that doesn't have an issue yet, you must first raise a new issue and then comment on it to get assigned.
4. **Join the community** - Follow our [Code of Conduct](CODE_OF_CONDUCT.md)

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Docker (optional, for local database)
- PostgreSQL database (local or cloud)

### Local Development Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub first
   git clone https://github.com/<your-username>/sea-notes-saas-starter-kit.git
   cd sea-notes-saas-starter-kit/application
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env-example .env
   # Edit .env with your configuration
   ```

   Windows PowerShell alternative:
   ```powershell
   Copy-Item env-example .env
   ```

4. **Database Setup**
   ```bash
   # Option A: Use Docker
   docker-compose up -d
   # or (newer Compose):
   docker compose up -d
   
   # Option B: Use DigitalOcean Managed PostgreSQL database
   # Update DATABASE_URL in .env
   
   # Initialize database
   npx prisma generate
   npx prisma migrate deploy
   ```

   If you changed the Prisma schema locally, prefer:
   ```bash
   npx prisma migrate dev
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Optional Services Setup

For full functionality, consider setting up:

- **Email (Resend)**: For password reset, magic links, and notifications
- **File Storage (DigitalOcean Spaces)**: For file uploads
- **Stripe**: For subscription billing
- **DigitalOcean Gradient AI**: For AI features

See the [README.md](README.md) for detailed setup instructions for each service.

## Testing

- Write tests for new features
- Maintain good test coverage
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies appropriately (Resend/Stripe/Spaces/AI)

Common commands:
```bash
# Run unit tests (JSDOM)
npm test

# Server-side tests
npm run test:server

# All tests
npm run test:all

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

## Pull Request Process

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow proper code standards
   - Write tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run build
   ```

4. **Commit your changes**
### Pre-PR Checks

Run these before opening a PR (from `application/`):
```bash
npm run lint
npx tsc --noEmit
npm run test:all
npm run build
```
If you updated Prisma schema:
```bash
npx prisma generate
npx prisma migrate dev
```
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Format

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add magic link authentication
fix(notes): resolve note deletion bug
docs(readme): update deployment instructions
```

### Submitting the PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Use the PR template if available
   - Provide a clear description of changes
   - Link related issues
   - Include screenshots for UI changes

3. **PR Checklist**
   - [ ] Code follows project standards
   - [ ] Lint, type-check, and tests pass
   - [ ] Documentation updated (README/docs, screenshots if UI)
   - [ ] Prisma migrations included (if schema changed)
   - [ ] Backward compatibility considered
   - [ ] Links issues (e.g., Fixes #123)

## Issue Guidelines

### Reporting Bugs

When reporting bugs, please include:

1. **Clear description** of the problem
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Environment details** (OS, browser, Node version)
5. **Screenshots or videos** if applicable
6. **Console errors** if any

### Feature Requests

For feature requests:

1. **Clear description** of the feature
2. **Use case** and benefits
3. **Proposed implementation** (if you have ideas)
4. **Mockups or examples** if applicable

### Issue Templates

Use the appropriate issue template:
- Bug report
- Feature request
- Documentation improvement
- Security vulnerability

### Responding to Reviews

- Address all feedback
- Ask for clarification if needed
- Push additional commits if requested
- Update the PR description with changes

## Documentation

### Documentation Standards

- Keep documentation up to date
- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Update README.md for major changes

### Documentation Types

- **README.md**: Project overview and quick start
- **CONTRIBUTING.md**: This file
- **docs/**: Detailed guides and tutorials
- **Code comments**: Inline documentation


### Updating Documentation

When making changes that affect documentation:

1. Update relevant docs
2. Add examples for new features
3. Update screenshots if UI changes
4. Verify all links work
5. Test documentation instructions

## Community Guidelines

### Communication

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative and supportive
- Give credit where due
- Help others learn and grow

### Getting Help

- Check existing documentation first
- Search existing issues and discussions
- Ask questions in issues or discussions
- Provide context when asking for help
- Be patient with responses

## License

By contributing to SeaNotes, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to SeaNotes! Your contributions help make this project better for everyone.
