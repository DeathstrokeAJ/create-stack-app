import chalk from "chalk"
import inquirer from "inquirer"
import ora from "ora"
import { execSync } from "child_process"
import fs from "fs-extra"
import path from "path"
import { generateTemplate } from "./generator.js"
import { validateProjectName, getPackageManager } from "./utils.js"

const FRONTEND_FRAMEWORKS = [
  { name: "Next.js 14 (Recommended)", value: "nextjs" },
  { name: "React.js with Vite", value: "react" },
]

const UI_FRAMEWORKS = [
  { name: "ShadCN UI (Recommended)", value: "shadcn" },
  { name: "Tailwind CSS", value: "tailwind" },
  { name: "Material UI", value: "mui" },
]

const BACKEND_STACKS = [
  { name: "Firebase (Recommended)", value: "firebase" },
  { name: "MongoDB with Mongoose", value: "mongodb" },
  { name: "PostgreSQL with Sequelize", value: "postgres" },
  { name: "None (Frontend only)", value: "none" },
]

export async function createStackApp(projectName) {
  console.log(chalk.blue.bold("🚀 Create Stack App"))
  console.log(chalk.gray("Generate modern full-stack web applications with ease!\n"))

  // Validate project name
  const validation = validateProjectName(projectName)
  if (!validation.valid) {
    console.error(chalk.red("❌ Invalid project name:"))
    validation.errors?.forEach((error) => {
      console.error(chalk.red(`   • ${error}`))
    })
    throw new Error("Invalid project name")
  }

  // Check if directory already exists
  const projectPath = path.join(process.cwd(), projectName)
  if (await fs.pathExists(projectPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: `Directory "${projectName}" already exists. Do you want to overwrite it?`,
        default: false,
      },
    ])

    if (!overwrite) {
      console.log(chalk.yellow("Operation cancelled."))
      return
    }

    await fs.remove(projectPath)
  }

  // Get user preferences
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "frontend",
      message: "Choose a frontend framework:",
      choices: FRONTEND_FRAMEWORKS,
      default: "nextjs",
    },
    {
      type: "list",
      name: "ui",
      message: "Choose a UI library:",
      choices: UI_FRAMEWORKS,
      default: "shadcn",
    },
    {
      type: "list",
      name: "backend",
      message: "Choose a backend:",
      choices: BACKEND_STACKS,
      default: "firebase",
    },
    {
      type: "confirm",
      name: "typescript",
      message: "Do you want to use TypeScript?",
      default: true,
    },
    {
      type: "confirm",
      name: "auth",
      message: "Do you want authentication pre-configured?",
      default: true,
      when: (answers) => answers.backend !== "none",
    },
    {
      type: "confirm",
      name: "animations",
      message: "Do you want to add animation libraries (Framer Motion & GSAP)?",
      default: false,
    },
    {
      type: "confirm",
      name: "threeD",
      message: "Do you want to add 3D support (Three.js)?",
      default: false,
    },
    {
      type: "confirm",
      name: "testing",
      message: "Do you want to include testing setup (Jest & Testing Library)?",
      default: true,
    },
    {
      type: "confirm",
      name: "docker",
      message: "Do you want Docker configuration?",
      default: false,
    },
  ])

  const config = {
    projectName,
    ...answers,
    auth: answers.backend === "none" ? false : answers.auth,
  }

  // Display configuration summary
  console.log(chalk.blue("\n📋 Configuration Summary:"))
  console.log(chalk.gray("─".repeat(50)))
  console.log(`${chalk.bold("Project Name:")} ${chalk.cyan(config.projectName)}`)
  console.log(`${chalk.bold("Frontend:")} ${chalk.cyan(config.frontend)}`)
  console.log(`${chalk.bold("UI Framework:")} ${chalk.cyan(config.ui)}`)
  console.log(`${chalk.bold("Backend:")} ${chalk.cyan(config.backend)}`)
  console.log(`${chalk.bold("TypeScript:")} ${config.typescript ? chalk.green("✅") : chalk.red("❌")}`)
  console.log(`${chalk.bold("Authentication:")} ${config.auth ? chalk.green("✅") : chalk.red("❌")}`)
  console.log(`${chalk.bold("Animations:")} ${config.animations ? chalk.green("✅") : chalk.red("❌")}`)
  console.log(`${chalk.bold("3D Support:")} ${config.threeD ? chalk.green("✅") : chalk.red("❌")}`)
  console.log(`${chalk.bold("Testing:")} ${config.testing ? chalk.green("✅") : chalk.red("❌")}`)
  console.log(`${chalk.bold("Docker:")} ${config.docker ? chalk.green("✅") : chalk.red("❌")}`)
  console.log(chalk.gray("─".repeat(50)))

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Proceed with this configuration?",
      default: true,
    },
  ])

  if (!confirm) {
    console.log(chalk.yellow("Operation cancelled."))
    return
  }

  // Generate the project
  const spinner = ora("Generating your stack...").start()

  try {
    // Step 1: Generate template
    spinner.text = "Creating project structure..."
    await generateTemplate(config)
    spinner.succeed(chalk.green("✨ Project structure created!"))

    // Step 2: Install dependencies
    const packageManager = getPackageManager()
    const installSpinner = ora(`Installing dependencies with ${packageManager}...`).start()

    try {
      process.chdir(projectPath)

      if (packageManager === "yarn") {
        execSync("yarn install", { stdio: "pipe" })
      } else if (packageManager === "pnpm") {
        execSync("pnpm install", { stdio: "pipe" })
      } else {
        execSync("npm install", { stdio: "pipe" })
      }

      installSpinner.succeed(chalk.green("📦 Dependencies installed!"))
    } catch (error) {
      installSpinner.warn(chalk.yellow("⚠️  Dependencies installation failed. You can install them manually."))
      console.log(chalk.gray(`Run: cd ${projectName} && ${packageManager} install`))
    }

    // Step 3: Initialize git repository
    const gitSpinner = ora("Initializing git repository...").start()
    try {
      execSync("git init", { stdio: "pipe" })
      execSync("git add .", { stdio: "pipe" })
      execSync('git commit -m "Initial commit from create-stack-app"', { stdio: "pipe" })
      gitSpinner.succeed(chalk.green("📝 Git repository initialized!"))
    } catch (error) {
      gitSpinner.warn(chalk.yellow("⚠️  Git initialization failed. You can initialize it manually."))
    }

    // Success message and next steps
    console.log(chalk.green.bold("\n🎉 Your project is ready!"))
    console.log(chalk.blue("\n📚 Next steps:"))
    console.log(chalk.gray(`   cd ${config.projectName}`))

    if (config.backend !== "none") {
      console.log(chalk.gray("   cp .env.example .env"))
      console.log(chalk.gray("   # Configure your environment variables"))
    }

    console.log(chalk.gray(`   ${packageManager} run dev`))

    console.log(chalk.blue("\n🔧 Available scripts:"))
    console.log(chalk.gray(`   ${packageManager} run dev       - Start development server`))
    console.log(chalk.gray(`   ${packageManager} run build     - Build for production`))
    console.log(chalk.gray(`   ${packageManager} run lint      - Run ESLint`))

    if (config.testing) {
      console.log(chalk.gray(`   ${packageManager} run test      - Run tests`))
    }

    if (config.backend !== "none") {
      console.log(chalk.gray(`   ${packageManager} run seed-db   - Seed database with sample data`))
    }

    if (config.backend !== "none") {
      console.log(chalk.blue("\n⚙️  Environment setup:"))
      console.log(chalk.yellow("   Don't forget to configure your environment variables in .env"))

      if (config.backend === "firebase") {
        console.log(chalk.gray("   • Firebase configuration"))
      } else if (config.backend === "mongodb") {
        console.log(chalk.gray("   • MongoDB connection string"))
      } else if (config.backend === "postgres") {
        console.log(chalk.gray("   • PostgreSQL connection string"))
      }

      if (config.auth) {
        console.log(chalk.gray("   • JWT secret for authentication"))
      }
    }

    console.log(chalk.blue("\n📖 Documentation:"))
    console.log(chalk.gray("   Check README.md for detailed setup instructions"))
    console.log(chalk.gray("   Visit the project directory for more information"))

    console.log(chalk.green.bold("\n✨ Happy coding! 🚀"))
  } catch (error) {
    spinner.fail(chalk.red("❌ Failed to generate stack"))
    console.error(chalk.red("\nError details:"))
    console.error(chalk.red(error.message))

    if (error.stack) {
      console.error(chalk.gray("\nStack trace:"))
      console.error(chalk.gray(error.stack))
    }

    throw error
  }
}
