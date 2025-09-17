# Fox Shrine VTuber Website

This project is a React application built with Vite for fast development and optimized builds.

## Development

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
# or
npm start
```

The app will run at [http://localhost:3000](http://localhost:3000) with hot module replacement.

## Available Scripts

### `npm run dev` or `npm start`

Runs the app in development mode using Vite's dev server.
The page will reload when you make changes and you'll see build errors and lint warnings in the console.

### `npm run build`

Builds the app for production to the `build` folder using Vite.
The build is optimized and files are minified with hashed filenames for caching.

### `npm run preview`

Locally preview the production build.

### `npm test`

Runs the test suite using Jest.

### `npm run test:watch`

Runs the test suite in watch mode.

### `npm run test:coverage`

Runs tests and generates a coverage report.

## Technology Stack

- **React 19** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Jest** - Testing framework
- **React Router** - Client-side routing
- **Framer Motion** - Animation library

## Migration from Create React App

This project was migrated from Create React App to Vite for:
- ⚡ Faster development server startup
- 🔥 Quicker hot module replacement
- 📦 Better build performance
- 🎯 Smaller bundle sizes
- 🛠️ Modern tooling and active development

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── contexts/      # React contexts
└── assets/        # Static assets
```

## Performance

Vite provides significant performance improvements over Create React App:
- Development server starts ~10x faster
- Hot module replacement is nearly instantaneous
- Build times are reduced by ~50-70%

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
