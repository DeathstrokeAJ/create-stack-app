import fs from "fs-extra"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function generateTemplate(config) {
  const { projectName, frontend, ui, backend, typescript, auth, animations, threeD, testing, docker } = config

  try {
    // Create project directory
    const projectPath = path.join(process.cwd(), projectName)
    await fs.ensureDir(projectPath)

    // Create directory structure
    await createDirectoryStructure(projectPath, config)

    // Generate package.json
    await generatePackageJson(projectPath, config)

    // Generate configuration files
    await generateConfigFiles(projectPath, config)

    // Generate source files
    await generateSourceFiles(projectPath, config)

    // Generate backend files
    if (backend !== "none") {
      await generateBackendFiles(projectPath, config)
    }

    // Generate documentation
    await generateDocumentation(projectPath, config)

    // Generate additional files
    await generateAdditionalFiles(projectPath, config)
  } catch (error) {
    console.error("Error generating template:", error)
    throw error
  }
}

async function createDirectoryStructure(projectPath, config) {
  const { backend, testing } = config

  const dirs = [
    "src",
    "src/app",
    "src/app/about",
    "src/app/contact",
    "src/components",
    "src/components/ui",
    "src/lib",
    "src/hooks",
    "src/utils",
    "src/styles",
    "public",
    "public/images",
    ".github",
    ".github/workflows",
  ]

  // Add backend directories
  if (backend !== "none") {
    dirs.push(
      "src/backend",
      "src/backend/config",
      "src/backend/models",
      "src/backend/utils",
      "src/backend/lib",
      "scripts",
    )
  }

  // Add testing directories
  if (testing) {
    dirs.push("__tests__", "__tests__/components", "__tests__/utils", "__tests__/pages")
  }

  // Ensure all directories exist
  for (const dir of dirs) {
    await fs.ensureDir(path.join(projectPath, dir))
  }
}

async function generatePackageJson(projectPath, config) {
  const { projectName, frontend, ui, backend, typescript, auth, animations, threeD, testing, docker } = config

  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      "type-check": typescript ? "tsc --noEmit" : undefined,
      test: testing ? "jest" : undefined,
      "test:watch": testing ? "jest --watch" : undefined,
      "test:coverage": testing ? "jest --coverage" : undefined,
      prepare: "husky install",
    },
    dependencies: {
      next: "14.2.4",
      react: "18.2.0",
      "react-dom": "18.2.0",
      zod: "3.22.4",
      "class-variance-authority": "0.7.0",
      clsx: "2.1.0",
      "tailwind-merge": "2.2.1",
      "lucide-react": "0.344.0",
    },
    devDependencies: {
      eslint: "8.57.0",
      "eslint-config-next": "14.2.4",
      "eslint-config-prettier": "9.1.0",
      "eslint-plugin-prettier": "5.1.3",
      prettier: "3.2.5",
      husky: "9.0.11",
      "lint-staged": "15.2.2",
    },
  }

  // Add TypeScript dependencies
  if (typescript) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      typescript: "5.4.2",
      "@types/react": "18.2.64",
      "@types/node": "20.11.25",
      "@types/react-dom": "18.2.21",
    }
  }

  // Add UI framework dependencies
  if (ui === "shadcn") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "@radix-ui/react-icons": "1.3.0",
      "@radix-ui/react-slot": "1.0.2",
      "@radix-ui/react-dialog": "1.0.5",
      "@radix-ui/react-dropdown-menu": "2.0.6",
      "@radix-ui/react-avatar": "1.0.4",
      "tailwindcss-animate": "1.0.7",
      tailwindcss: "3.4.1",
      postcss: "8.4.35",
      autoprefixer: "10.4.18",
    }
  } else if (ui === "tailwind") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      tailwindcss: "3.4.1",
      postcss: "8.4.35",
      autoprefixer: "10.4.18",
    }
  } else if (ui === "mui") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "@mui/material": "5.15.12",
      "@mui/icons-material": "5.15.12",
      "@emotion/react": "11.11.4",
      "@emotion/styled": "11.11.0",
    }
  }

  // Add backend dependencies
  if (backend === "firebase") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      firebase: "10.8.1",
      "firebase-admin": "12.0.0",
    }
  } else if (backend === "mongodb") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      mongoose: "8.2.1",
      mongodb: "6.3.0",
    }
  } else if (backend === "postgres") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      pg: "8.11.3",
      sequelize: "6.37.1",
    }
    if (typescript) {
      packageJson.devDependencies["@types/pg"] = "8.11.0"
    }
  }

  // Add authentication dependencies
  if (auth) {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "next-auth": "4.24.6",
      jsonwebtoken: "9.0.2",
      bcryptjs: "2.4.3",
    }
    if (typescript) {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        "@types/jsonwebtoken": "9.0.5",
        "@types/bcryptjs": "2.4.6",
      }
    }
  }

  // Add animation dependencies
  if (animations) {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "framer-motion": "11.0.8",
      gsap: "3.12.5",
    }
    if (typescript) {
      packageJson.devDependencies["@types/gsap"] = "3.0.0"
    }
  }

  // Add 3D dependencies
  if (threeD) {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      three: "0.162.0",
      "@react-three/fiber": "8.15.19",
      "@react-three/drei": "9.102.6",
    }
    if (typescript) {
      packageJson.devDependencies["@types/three"] = "0.162.0"
    }
  }

  // Add testing dependencies
  if (testing) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      jest: "29.7.0",
      "@testing-library/react": "14.2.1",
      "@testing-library/jest-dom": "6.4.2",
      "@testing-library/user-event": "14.5.2",
      "jest-environment-jsdom": "29.7.0",
    }
    if (typescript) {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        "@types/jest": "29.5.12",
        "ts-jest": "29.1.2",
      }
    }
  }

  // Remove undefined values
  Object.keys(packageJson.scripts).forEach((key) => {
    if (packageJson.scripts[key] === undefined) {
      delete packageJson.scripts[key]
    }
  })

  // Add backend-specific scripts
  if (backend !== "none") {
    packageJson.scripts["seed-db"] = "node scripts/seed-db.js"
  }

  await fs.writeJson(path.join(projectPath, "package.json"), packageJson, { spaces: 2 })
}

async function generateConfigFiles(projectPath, config) {
  const { typescript, ui, testing, docker } = config

  // Next.js config
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;`

  await fs.writeFile(path.join(projectPath, "next.config.js"), nextConfig)

  // TypeScript config
  if (typescript) {
    const tsConfig = {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./src/*"] },
        baseUrl: ".",
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    }
    await fs.writeJson(path.join(projectPath, "tsconfig.json"), tsConfig, { spaces: 2 })
  }

  // Tailwind config
  if (ui === "tailwind" || ui === "shadcn") {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`

    await fs.writeFile(path.join(projectPath, "tailwind.config.js"), tailwindConfig)

    // PostCSS config
    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
    await fs.writeFile(path.join(projectPath, "postcss.config.js"), postcssConfig)
  }

  // ESLint config
  const eslintConfig = `module.exports = {
  extends: [
    'next/core-web-vitals',
    ${typescript ? "'@typescript-eslint/recommended'," : ""}
    'prettier',
  ],
  ${typescript ? "parser: '@typescript-eslint/parser'," : ""}
  ${typescript ? "plugins: ['@typescript-eslint']," : ""}
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    ${typescript ? "'@typescript-eslint/explicit-module-boundary-types': 'off'," : ""}
    ${typescript ? "'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]," : ""}
    'prettier/prettier': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}`

  await fs.writeFile(path.join(projectPath, ".eslintrc.js"), eslintConfig)

  // Prettier config
  const prettierConfig = `module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
};`

  await fs.writeFile(path.join(projectPath, ".prettierrc.js"), prettierConfig)

  // Jest config
  if (testing) {
    const jestConfig = `const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)`

    await fs.writeFile(path.join(projectPath, "jest.config.js"), jestConfig)

    const jestSetup = `import '@testing-library/jest-dom';`
    await fs.writeFile(path.join(projectPath, "jest.setup.js"), jestSetup)
  }

  // Docker files
  if (docker) {
    await generateDockerFiles(projectPath, config)
  }

  // Git files
  const gitignore = `# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/

# Logs
logs
*.log

# Database
*.db
*.sqlite`

  await fs.writeFile(path.join(projectPath, ".gitignore"), gitignore)
}

async function generateSourceFiles(projectPath, config) {
  const { ui, typescript, auth, animations, threeD } = config
  const ext = typescript ? "tsx" : "jsx"

  // Generate layout
  await generateLayout(projectPath, config)

  // Generate pages
  await generatePages(projectPath, config)

  // Generate components
  await generateComponents(projectPath, config)

  // Generate utilities
  await generateUtilities(projectPath, config)

  // Generate styles
  await generateStyles(projectPath, config)
}

async function generateLayout(projectPath, config) {
  const { ui, typescript } = config
  const ext = typescript ? "tsx" : "jsx"

  const layout = `import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
${ui === "shadcn" ? `import { ThemeProvider } from "@/components/theme-provider"` : ""}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        ${ui === "shadcn" ? `<ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >` : ""}
        {children}
        ${ui === "shadcn" ? `</ThemeProvider>` : ""}
      </body>
    </html>
  )
}`

  await fs.writeFile(path.join(projectPath, "src", "app", `layout.${ext}`), layout)
}

async function generatePages(projectPath, config) {
  const { typescript } = config
  const ext = typescript ? "tsx" : "jsx"

  // Home page
  const homePage = `import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to ${config.projectName}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          A modern web application built with Next.js, TypeScript, and Tailwind CSS.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>🚀 Modern Stack</CardTitle>
            <CardDescription>Built with the latest technologies</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Next.js 14, TypeScript, Tailwind CSS, and more.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚡ Fast Development</CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Pre-configured with best practices and modern tooling.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎨 Beautiful UI</CardTitle>
            <CardDescription>Stunning user interface</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Beautiful components with dark mode support.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}`

  await fs.writeFile(path.join(projectPath, "src", "app", `page.${ext}`), homePage)

  // About page
  const aboutPage = `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">About Us</h1>
        <p className="text-lg text-muted-foreground">
          Learn more about our mission and values.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We are dedicated to providing the best possible experience for our users.
              Our mission is to create innovative solutions that make a difference.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4">
              <li>Innovation</li>
              <li>Quality</li>
              <li>User Focus</li>
              <li>Integrity</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}`

  await fs.writeFile(path.join(projectPath, "src", "app", "about", `page.${ext}`), aboutPage)

  // Contact page
  const contactPage = `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-lg text-muted-foreground">
          Get in touch with our team.
        </p>
      </section>

      <section className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message"
                  rows={4}
                  required
                />
              </div>
              <Button type="submit">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}`

  await fs.writeFile(path.join(projectPath, "src", "app", "contact", `page.${ext}`), contactPage)
}

async function generateComponents(projectPath, config) {
  const { ui, typescript } = config
  const ext = typescript ? "tsx" : "jsx"

  // Create necessary directories
  await fs.ensureDir(path.join(projectPath, "src", "components", "ui"))
  await fs.ensureDir(path.join(projectPath, "src", "lib"))

  if (ui === "shadcn") {
    await generateShadcnComponents(projectPath, config)
  }

  // Generate theme provider for shadcn
  if (ui === "shadcn") {
    const themeProvider = `'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}`

    await fs.writeFile(path.join(projectPath, "src", "components", `theme-provider.${ext}`), themeProvider)
  }
}

async function generateShadcnComponents(projectPath, config) {
  const { typescript } = config
  const ext = typescript ? "tsx" : "jsx"
  const uiDir = path.join(projectPath, "src", "components", "ui")

  // Ensure UI directory exists
  await fs.ensureDir(uiDir)

  // Generate utils.ts first since components depend on it
  const utils = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`

  await fs.writeFile(path.join(projectPath, "src", "lib", "utils.ts"), utils)

  // Button component
  const button = `import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };`

  await fs.writeFile(path.join(uiDir, `button.${ext}`), button)

  // Card component
  const card = `import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };`

  await fs.writeFile(path.join(uiDir, `card.${ext}`), card)

  // ... rest of the components ...
}

async function generateUtilities(projectPath, config) {
  const { typescript } = config
  const ext = typescript ? "ts" : "js"

  // Generate utils.ts
  const utils = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`

  await fs.writeFile(path.join(projectPath, "src", "lib", `utils.${ext}`), utils)
}

async function generateStyles(projectPath, config) {
  const { ui } = config

  let globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`

  if (ui === "shadcn") {
    globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
 
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
 
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
 
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
 
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
 
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
 
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
 
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
 
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
 
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
 
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
 
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
 
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
 
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
 
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
 
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
 
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
 
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`
  }

  await fs.writeFile(path.join(projectPath, "src", "app", "globals.css"), globalsCss)
}

async function generateBackendFiles(projectPath, config) {
  const { backend, typescript, auth } = config
  const ext = typescript ? "ts" : "js"

  if (backend === "firebase") {
    await generateFirebaseBackend(projectPath, config)
  } else if (backend === "mongodb") {
    await generateMongoDBBackend(projectPath, config)
  } else if (backend === "postgres") {
    await generatePostgresBackend(projectPath, config)
  }

  // Generate API routes
  await generateAPIRoutes(projectPath, config)

  // Generate database seeding script
  if (backend !== "none") {
    await generateSeedScript(projectPath, config)
  }
}

async function generateFirebaseBackend(projectPath, config) {
  const { typescript } = config
  const ext = typescript ? "ts" : "js"

  const firebaseConfig = `import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };`

  await fs.writeFile(path.join(projectPath, "src", "backend", "config", `firebase.${ext}`), firebaseConfig)
}

async function generateMongoDBBackend(projectPath, config) {
  const { typescript } = config
  const ext = typescript ? "ts" : "js"

  const mongoConfig = `import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;`

  await fs.writeFile(path.join(projectPath, "src", "backend", "config", `mongodb.${ext}`), mongoConfig)

  // User model
  const userModel = `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword${typescript ? ": string" : ""}) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);`

  await fs.writeFile(path.join(projectPath, "src", "backend", "models", `User.${ext}`), userModel)
}

async function generatePostgresBackend(projectPath, config) {
  const { typescript } = config
  const ext = typescript ? "ts" : "js"

  const postgresConfig = `import { Sequelize } from 'sequelize';

const POSTGRES_URI = process.env.POSTGRES_URI;

if (!POSTGRES_URI) {
  throw new Error('Please define the POSTGRES_URI environment variable inside .env');
}

const sequelize = new Sequelize(POSTGRES_URI, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;`

  await fs.writeFile(path.join(projectPath, "src", "backend", "config", `postgres.${ext}`), postgresConfig)
}

async function generateAPIRoutes(projectPath, config) {
  const { backend, typescript } = config
  const ext = typescript ? "ts" : "js"

  // Create API directory structure
  const apiDir = path.join(projectPath, "src", "app", "api")
  const usersDir = path.join(apiDir, "users")
  const userIdDir = path.join(usersDir, "[id]")

  await fs.ensureDir(usersDir)
  await fs.ensureDir(userIdDir)

  // Basic users route
  const usersRoute = `import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Implement get users logic
    return NextResponse.json({ message: 'Get users endpoint' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request${typescript ? ": Request" : ""}) {
  try {
    const data = await request.json();
    // TODO: Implement create user logic
    return NextResponse.json({ message: 'Create user endpoint', data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`

  await fs.writeFile(path.join(usersDir, `route.${ext}`), usersRoute)

  // Dynamic user route
  const userRoute = `import { NextResponse } from 'next/server';

export async function GET(
  request${typescript ? ": Request" : ""},
  { params }${typescript ? ": { params: { id: string } }" : ""}
) {
  try {
    const { id } = params;
    // TODO: Implement get user by id logic
    return NextResponse.json({ message: 'Get user by id', id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request${typescript ? ": Request" : ""},
  { params }${typescript ? ": { params: { id: string } }" : ""}
) {
  try {
    const { id } = params;
    const data = await request.json();
    // TODO: Implement update user logic
    return NextResponse.json({ message: 'Update user', id, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request${typescript ? ": Request" : ""},
  { params }${typescript ? ": { params: { id: string } }" : ""}
) {
  try {
    const { id } = params;
    // TODO: Implement delete user logic
    return NextResponse.json({ message: 'Delete user', id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`

  await fs.writeFile(path.join(userIdDir, `route.${ext}`), userRoute)
}

async function generateSeedScript(projectPath, config) {
  const { backend } = config

  let seedScript = ""

  if (backend === "mongodb") {
    seedScript = `const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Add your seeding logic here
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

const main = async () => {
  await connectDB();
  await seedData();
};

main();`
  } else if (backend === "postgres") {
    seedScript = `const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.POSTGRES_URI);

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected');
    
    // Add your seeding logic here
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await sequelize.close();
  }
};

seedData();`
  } else if (backend === "firebase") {
    seedScript = `const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const seedData = async () => {
  try {
    // Add your seeding logic here
    console.log('Firestore seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

seedData();`
  }

  if (seedScript) {
    await fs.writeFile(path.join(projectPath, "scripts", "seed-db.js"), seedScript)
  }
}

async function generateDockerFiles(projectPath, config) {
  const { backend } = config

  const dockerfile = `FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]`

  await fs.writeFile(path.join(projectPath, "Dockerfile"), dockerfile)

  // Docker compose
  let dockerCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production`

  if (backend === "mongodb") {
    dockerCompose += `
      - MONGODB_URI=mongodb://mongodb:27017/${config.projectName}
    depends_on:
      - mongodb

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:`
  } else if (backend === "postgres") {
    dockerCompose += `
      - POSTGRES_URI=postgres://postgres:postgres@postgres:5432/${config.projectName}
    depends_on:
      - postgres

  postgres:
    image: postgres:latest
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=${config.projectName}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`
  }

  await fs.writeFile(path.join(projectPath, "docker-compose.yml"), dockerCompose)
}

async function generateDocumentation(projectPath, config) {
  const { projectName, frontend, ui, backend, typescript, auth, animations, threeD, testing, docker } = config

  const readme = `# ${projectName}

This project was generated using **create-stack-app** - a modern CLI tool for generating full-stack web applications.

## 🚀 Features

- **Frontend:** ${frontend === "nextjs" ? "Next.js 14 with App Router" : "React.js with Vite"}
- **UI Framework:** ${ui === "shadcn" ? "ShadCN UI with Tailwind CSS" : ui === "tailwind" ? "Tailwind CSS" : "Material UI"}
- **Backend:** ${backend === "none" ? "None (Frontend only)" : backend === "firebase" ? "Firebase" : backend === "mongodb" ? "MongoDB with Mongoose" : "PostgreSQL with Sequelize"}
- **TypeScript:** ${typescript ? "✅ Yes" : "❌ No"}
- **Authentication:** ${auth ? "✅ Yes" : "❌ No"}
- **Animations:** ${animations ? "✅ Yes (Framer Motion & GSAP)" : "❌ No"}
- **3D Support:** ${threeD ? "✅ Yes (Three.js)" : "❌ No"}
- **Testing:** ${testing ? "✅ Yes (Jest & Testing Library)" : "❌ No"}
- **Docker:** ${docker ? "✅ Yes" : "❌ No"}

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone and navigate to the project:**
   \`\`\`bash
   cd ${projectName}
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edit the \`.env\` file with your configuration values.

${
  backend !== "none"
    ? `4. **Seed the database (optional):**
   \`\`\`bash
   npm run seed-db
   \`\`\`

5. **Start the development server:**`
    : "4. **Start the development server:**"
}
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── about/          # About page
│   │   ├── contact/        # Contact page
│   │   ├── api/            # API routes
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   └── ui/            # UI components
│   ├── lib/               # Utility libraries
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
${
  backend !== "none"
    ? `│   └── backend/           # Backend code
│       ├── config/        # Database configuration
│       ├── models/        # Data models
│       └── utils/         # Backend utilities`
    : ""
}
├── public/                # Static assets
${testing ? "├── __tests__/           # Test files" : ""}
${backend !== "none" ? "├── scripts/             # Database scripts" : ""}
${docker ? "├── Dockerfile           # Docker configuration" : ""}
${docker ? "├── docker-compose.yml   # Docker Compose" : ""}
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
└── README.md            # This file
\`\`\`

## 🔧 Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint
${typescript ? "- `npm run type-check` - Run TypeScript type checking" : ""}
${testing ? "- `npm run test` - Run tests" : ""}
${testing ? "- `npm run test:watch` - Run tests in watch mode" : ""}
${testing ? "- `npm run test:coverage` - Run tests with coverage" : ""}
${backend !== "none" ? "- `npm run seed-db` - Seed database with sample data" : ""}

## ⚙️ Environment Variables

${
  backend !== "none"
    ? `Create a \`.env\` file in the root directory with the following variables:

\`\`\`env
# General
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

${
  backend === "firebase"
    ? `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id`
    : ""
}

${
  backend === "mongodb"
    ? `# MongoDB
MONGODB_URI=mongodb://localhost:27017/${projectName}`
    : ""
}

${
  backend === "postgres"
    ? `# PostgreSQL
POSTGRES_URI=postgres://username:password@localhost:5432/${projectName}`
    : ""
}

${
  auth
    ? `# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d`
    : ""
}
\`\`\``
    : "This project doesn't require environment variables for basic functionality."
}

## 🎨 Customization

### Styling
${ui === "shadcn" ? "- Components use ShadCN UI with Tailwind CSS" : ui === "tailwind" ? "- Styling is done with Tailwind CSS" : "- Styling uses Material UI components"}
- Global styles are in \`src/app/globals.css\`
- Tailwind configuration is in \`tailwind.config.js\`

### Components
- UI components are in \`src/components/ui/\`
- Custom components go in \`src/components/\`
- Follow the established patterns for consistency

${
  backend !== "none"
    ? `### Database
${backend === "firebase" ? "- Firebase configuration is in `src/backend/config/firebase.ts`" : backend === "mongodb" ? "- MongoDB models are in `src/backend/models/`" : "- PostgreSQL models are in `src/backend/models/`"}
- Database utilities are in \`src/backend/utils/\`
- API routes are in \`src/app/api/\``
    : ""
}

## 🧪 Testing

${
  testing
    ? `This project includes a comprehensive testing setup:

- **Jest** for unit testing
- **React Testing Library** for component testing
- **Testing utilities** in \`__tests__/\`

Run tests with:
\`\`\`bash
npm run test
\`\`\`

For watch mode:
\`\`\`bash
npm run test:watch
\`\`\`

For coverage:
\`\`\`bash
npm run test:coverage
\`\`\``
    : "Testing is not configured. You can add Jest and React Testing Library if needed."
}

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Docker
${
  docker
    ? `Build and run with Docker:
\`\`\`bash
docker-compose up -d
\`\`\`

Stop containers:
\`\`\`bash
docker-compose down
\`\`\``
    : "Docker configuration is not included. You can add Dockerfile and docker-compose.yml if needed."
}

### Other Platforms
- **Netlify:** Works great for static exports
- **Railway:** Good for full-stack apps
- **Heroku:** Classic choice for web apps

## 🔒 Security

- Input validation with Zod
- CORS configuration
- Security headers
${auth ? "- JWT authentication" : ""}
${auth ? "- Password hashing with bcrypt" : ""}
- Environment variable protection

## 📚 Learn More

### Technologies Used
- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
${ui === "shadcn" ? "- [ShadCN UI](https://ui.shadcn.com/) - UI components" : ""}
${ui === "tailwind" ? "- [Tailwind CSS](https://tailwindcss.com/docs)" : ""}
${ui === "mui" ? "- [Material UI](https://mui.com/) - React components" : ""}
${typescript ? "- [TypeScript](https://www.typescriptlang.org/) - Type safety" : ""}
${backend === "firebase" ? "- [Firebase](https://firebase.google.com/) - Backend platform" : ""}
${backend === "mongodb" ? "- [MongoDB](https://www.mongodb.com/) - Database" : ""}
${backend === "postgres" ? "- [PostgreSQL](https://www.postgresql.org/) - Database" : ""}
${animations ? "- [Framer Motion](https://www.framer.com/motion/) - Animations" : ""}
${threeD ? "- [Three.js](https://threejs.org/) - 3D graphics" : ""}

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
${ui === "tailwind" || ui === "shadcn" ? "- [Tailwind CSS Documentation](https://tailwindcss.com/docs)" : ""}

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Created with [create-stack-app](https://github.com/yourusername/create-stack-app)
- Built with modern web technologies
- Inspired by the developer community

---

**Happy coding! 🚀**

For support or questions, please open an issue in the repository.`

  await fs.writeFile(path.join(projectPath, "README.md"), readme)
}

async function generateAdditionalFiles(projectPath, config) {
  const { backend, auth } = config

  // Environment example file
  let envExample = `# Application
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

`

  if (backend === "firebase") {
    envExample += `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

`
  } else if (backend === "mongodb") {
    envExample += `# MongoDB
MONGODB_URI=mongodb://localhost:27017/${config.projectName}

`
  } else if (backend === "postgres") {
    envExample += `# PostgreSQL
POSTGRES_URI=postgres://username:password@localhost:5432/${config.projectName}

`
  }

  if (auth) {
    envExample += `# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

`
  }

  envExample += `# Logging
LOG_LEVEL=info

# API Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100`

  await fs.writeFile(path.join(projectPath, ".env.example"), envExample)

  // GitHub Actions workflow
  const workflow = `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    ${
      config.typescript
        ? `- name: Run type checking
      run: npm run type-check
    `
        : ""
    }
    ${
      config.testing
        ? `- name: Run tests
      run: npm run test
    `
        : ""
    }
    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: \${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'`

  await fs.writeFile(path.join(projectPath, ".github", "workflows", "ci-cd.yml"), workflow)

  // Husky and lint-staged configuration
  const lintStagedConfig = `{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}`

  await fs.writeFile(path.join(projectPath, ".lintstagedrc.json"), lintStagedConfig)

  // VSCode settings
  const vscodeDir = path.join(projectPath, ".vscode")
  await fs.ensureDir(vscodeDir)

  const vscodeSettings = `{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}`

  await fs.writeFile(path.join(vscodeDir, "settings.json"), vscodeSettings)

  const vscodeExtensions = `{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}`

  await fs.writeFile(path.join(vscodeDir, "extensions.json"), vscodeExtensions)
}
