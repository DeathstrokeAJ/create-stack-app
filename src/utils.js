import validatePackageName from 'validate-npm-package-name';

export function validateProjectName(name) {
  return validatePackageName(name);
}

export function getAvailableTemplates() {
  return {
    frontend: ['nextjs', 'react'],
    ui: ['shadcn', 'tailwind'],
    backend: ['firebase', 'express-mongodb', 'supabase']
  };
}

export function sanitizeProjectName(name) {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

function getPackageManager() {
  const userAgent = process.env.npm_config_user_agent;
  
  if (userAgent) {
    if (userAgent.includes('yarn')) return 'yarn';
    if (userAgent.includes('pnpm')) return 'pnpm';
  }
  
  return 'npm';
}

export { getPackageManager };