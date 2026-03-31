# Contributing to Employee Tracking System

Thank you for considering contributing to the Employee Tracking System! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node/Bun version)

### Suggesting Features

Feature requests are welcome! Please open an issue with:
- A clear description of the feature
- Use cases and benefits
- Any relevant examples or mockups

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** with clear, descriptive commit messages
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Ensure code quality**:
   ```bash
   bun run lint
   bun run format
   bun run test
   ```
6. **Submit your PR** with a clear description of changes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Employ_Tracking_System.git
cd Employ_Tracking_System

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Start development server
bun run dev
```

## Code Style

- Use TypeScript for type safety
- Follow existing code patterns
- Use functional components with hooks
- Keep components focused and reusable
- Write meaningful commit messages

## Commit Message Guidelines

Format: `type(scope): message`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(tracking): add battery level indicator
fix(auth): resolve session timeout issue
docs(readme): update installation instructions
```

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## Questions?

Feel free to open an issue for any questions or clarifications.

Thank you for contributing! 🎉