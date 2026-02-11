/**
 * Search command - Search for agent skills via unified API
 *
 * Calls /api/search endpoint to get results from:
 * - Vercel Skills (npx skills)
 * - ClawHub (npx clawhub)
 * - Local database (registered skills)
 */

import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';

// Shared imports from @myskills/shared
import type { SearchResponse, SkillResult } from '@myskills/shared/types';
import { searchSkills } from '@myskills/shared/api';
import type { SearchOptions as SharedSearchOptions } from '@myskills/shared/api/search';

// Map CLI options to shared options
interface SearchOptions {
  platform: string;
  minScore: string;
  limit: string;
}

export async function searchCommand(query: string[] | undefined, options: SearchOptions) {
  const searchTerm = query?.join(' ') || '';

  if (!searchTerm) {
    console.log(chalk.yellow('\n⚠️  Please provide a search query\n'));
    console.log(chalk.gray('Usage: npx myskills search <query>\n'));
    return;
  }

  console.log(chalk.cyan(`\n🔍 Searching for skills: "${searchTerm}"...\n`));

  const spinner = chalk.gray('Searching...');
  process.stdout.write(spinner);

  try {
    // Call unified API
    const url = `${API_BASE}/api/search?q=${encodeURIComponent(searchTerm)}&platform=${options.platform}&minScore=${options.minScore}&limit=${options.limit}`;
    const response = await fetch(url);

    // Clear spinner line
    process.stdout.write('\r' + ' '.repeat(spinner.length) + '\r');

    if (!response.ok) {
      console.error(chalk.red(`\n❌ API Error: ${response.status}`));
      console.log(chalk.gray('\nMake sure the frontend server is running:'));
      console.log(chalk.white('  cd frontend && npm run dev\n'));
      console.log(chalk.gray('Or set API base URL:'));
      console.log(chalk.white(`  export MYSKILLS_API_BASE=https://your-domain.com\n`));
      return;
    }

    const result: SearchResponse = await response.json();

    if (!result.success || result.data.length === 0) {
      console.log(chalk.yellow('No skills found matching your criteria.\n'));
      return;
    }

    // Display results
    const table = new Table({
      head: [
        chalk.cyan('Name'),
        chalk.cyan('Platform'),
        chalk.cyan('Source'),
        chalk.cyan('Install'),
      ],
      colWidths: [25, 15, 12, 30],
      wordWrap: true
    });

    result.data.forEach(skill => {
      table.push([
        skill.name,
        skill.platform,
        skill.source === 'local'
          ? chalk.magenta('MySkills')
          : skill.source === 'vercel'
            ? chalk.blue('Vercel')
            : chalk.white('ClawHub'),
        skill.installCommand,
      ]);
    });

    console.log(table.toString());

    // Show sources summary
    if (result.sources) {
      console.log(chalk.gray(`\nSources: ${result.sources.clawhub} from ClawHub, ${result.sources.vercel} from Vercel\n`));
    }

    console.log(chalk.gray(`💡 Use ${chalk.cyan('npx myskills scan <url>')} to check security before installing`));
    console.log(chalk.gray(`💡 Use ${chalk.cyan('npx myskills install <skill>')} to install via MySkills\n`));

  } catch (error) {
    process.stdout.write('\r' + ' '.repeat(spinner.length) + '\r');
    console.error(chalk.red(`\n❌ Search failed: ${error}`));
    console.log(chalk.gray('\nTroubleshooting:'));
    console.log(chalk.gray('  1. Make sure the frontend server is running'));
    console.log(chalk.gray('  2. Check API_BASE is correct'));
    console.log(chalk.gray('  3. Try: curl "' + url + '"\n'));
  }
}
