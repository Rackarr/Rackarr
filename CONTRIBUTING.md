# Contributing to Rackarr

Thank you for your interest in contributing to Rackarr!

## Development Setup

1. **Prerequisites**
   - Node.js 20 or later
   - npm 10 or later

2. **Clone and Install**

   ```bash
   git clone https://github.com/ggfevans/rackarr.git
   cd rackarr
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Code Style

This project uses automated code formatting and linting:

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **svelte-check**: Svelte-specific type checking

Pre-commit hooks automatically run linting and formatting on staged files.

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run check
```

### Testing

We follow Test-Driven Development (TDD). Write tests first, then implement.

```bash
# Run unit tests in watch mode
npm run test

# Run unit tests once
npm run test:run

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### Svelte 5 Runes

This project uses Svelte 5 with runes. Use the new reactivity primitives:

```svelte
<script lang="ts">
	// State
	let count = $state(0);

	// Derived values
	let doubled = $derived(count * 2);

	// Side effects
	$effect(() => {
		console.log('Count changed:', count);
	});

	// Props
	interface Props {
		name: string;
	}
	let { name }: Props = $props();
</script>
```

Do NOT use Svelte 4 stores (`writable`, `readable`, `derived` from `svelte/store`).

## Pull Request Process

1. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write tests first (TDD)
   - Implement the feature
   - Ensure all tests pass
   - Run linting and formatting

3. **Commit**
   - Use clear, descriptive commit messages
   - Follow conventional commits format when applicable

4. **Push and Create PR**
   - Push your branch
   - Create a pull request with a clear description
   - Reference any related issues

## Project Structure

```
src/
├── lib/
│   ├── components/     # UI components
│   ├── stores/         # State management
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── data/           # Static data
├── tests/              # Test files
└── App.svelte          # Root component
```

## Questions?

Open an issue for questions, bug reports, or feature requests.
