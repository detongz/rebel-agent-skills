export function getGitHubToken(): string | undefined {
  return process.env.MYSKILLS_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
}
