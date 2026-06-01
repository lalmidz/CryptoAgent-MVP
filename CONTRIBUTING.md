# Contributing to CryptoAgent MVP

Thank you for your interest in contributing to CryptoAgent! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/CryptoAgent-MVP.git`
3. Add upstream: `git remote add upstream https://github.com/lalmidz/CryptoAgent-MVP.git`
4. Create a branch: `git checkout -b feature/your-feature`

## Development Setup

See [SETUP.md](./docs/SETUP.md) for detailed instructions.

## Commit Guidelines

- Use clear, descriptive commit messages
- Format: `feat/fix/docs/style: description`
- Examples:
  - `feat: add Kraken exchange integration`
  - `fix: resolve portfolio calculation bug`
  - `docs: update API documentation`

## Pull Request Process

1. Ensure your code passes all tests
2. Update documentation if needed
3. Create a PR with a clear description
4. Link related issues
5. Wait for review and address feedback

## Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
flutter test
```

## Code Style

- Backend: Follow NestJS conventions
- Frontend: Follow Dart/Flutter best practices
- Use linters: ESLint (Backend), dartfmt (Frontend)

## Issues

- Check existing issues before creating new ones
- Use issue templates
- Provide clear reproduction steps

## Questions?

Open a discussion or email support@cryptoagent.io

Thank you for contributing! 🚀
