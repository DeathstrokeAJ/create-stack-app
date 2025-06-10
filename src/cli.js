import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import { createStackApp } from './installer.js';

const program = new Command();

// Display welcome message
console.log(
  chalk.blue(
    figlet.textSync('Create Stack App', { horizontalLayout: 'full' })
  )
);

program
  .name('create-stack-app')
  .description('CLI tool to generate full-stack web application templates')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project')
  .action(async (projectName) => {
    try {
      if (!projectName) {
        const { name } = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'What is your project named?',
            validate: (input) => {
              if (!input) {
                return 'Project name is required';
              }
              return true;
            },
          },
        ]);
        projectName = name;
      }

      await createStackApp(projectName);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

export { program };