#!/usr/bin/env node

import { program } from '../src/cli.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('An uncaught error occurred:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('An unhandled promise rejection occurred:', err);
  process.exit(1);
});

// Run the CLI
program.parse(process.argv);