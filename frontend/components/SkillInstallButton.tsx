// components/SkillInstallButton.tsx - npx skills install button
'use client';

import { useState } from 'react';

interface SkillInstallButtonProps {
  skill: {
    name: string;
    npm_package?: string;
    repository?: string;
  };
  onInstall?: () => void;
}

export function getSkillInstallCommand(skill: { name: string; npm_package?: string; repository?: string }): string {
  // Format: npx skills add @myskills/skill-name or npx skills add owner/repo@skill-name
  if (skill.npm_package) {
    return `npx skills add ${skill.npm_package}`;
  }
  // Generate from repository URL
  if (skill.repository) {
    const repoMatch = skill.repository.match(/github\.com\/([^\/]+\/[^\/\.]+)/);
    if (repoMatch) {
      const ownerRepo = repoMatch[1];
      const skillName = skill.name.toLowerCase().replace(/\s+/g, '-');
      return `npx skills add ${ownerRepo}@${skillName}`;
    }
  }
  // Fallback
  return `npx skills add myskills-protocol/${skill.name.toLowerCase().replace(/\s+/g, '-')}`;
}

export default function SkillInstallButton({ skill, onInstall }: SkillInstallButtonProps) {
  const [copied, setCopied] = useState(false);

  const installCommand = getSkillInstallCommand(skill);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (onInstall) {
        onInstall();
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback: select text manually
      const textArea = document.createElement('textarea');
      textArea.value = installCommand;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="skill-install-button"
      title={`Click to copy: ${installCommand}`}
    >
      {copied ? (
        <>
          <svg
            className="skill-install-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg
            className="skill-install-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Install</span>
        </>
      )}
    </button>
  );
}
