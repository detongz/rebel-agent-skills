// components/SkillCard.tsx - Skill 卡片组件
'use client';

import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { useRouter } from 'next/navigation';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/wagmi';
import SkillInstallButton from './SkillInstallButton';

interface SkillCardProps {
  skill: {
    id: number;
    skill_id?: string;
    name: string;
    description: string;
    platform: string;
    payment_address: string;
    total_tips: string;
    tip_count?: number;
    platform_likes?: number;
    npm_package?: string;
    repository?: string;
    homepage?: string;
    download_count?: number;
    github_stars?: number;
    github_forks?: number;
  };
  onTipped?: () => void;
}

export default function SkillCard({ skill, onTipped }: SkillCardProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const shortenAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const formatTips = (tips: string) => {
    const n = parseFloat(tips) / 1e18;
    return formatNumber(n);
  };

  const handleTip = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!skill.skill_id) {
      alert('Skill ID is missing, cannot tip');
      return;
    }

    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      // Fall back to navigate to detail page if contract not configured
      router.push(`/skill/${skill.id}`);
      return;
    }

    const input = window.prompt('Enter tip amount (ASKL)', '1');
    if (!input) return;

    let amountWei: bigint;
    try {
      amountWei = parseEther(input);
    } catch (error) {
      alert('Invalid amount format');
      return;
    }

    if (amountWei <= 0n) {
      alert('Please enter an amount greater than 0');
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'tipSkill',
        args: [skill.skill_id as `0x${string}`, amountWei],
      });

      const creatorReceived = (amountWei * 9800n) / 10000n;
      const platformFee = amountWei - creatorReceived;

      await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_id: skill.id,
          amount: amountWei.toString(),
          message: '',
          from_address: address,
          tx_hash: hash,
        }),
      });

      if (onTipped) onTipped();
      alert('Tip submitted successfully!');
    } catch (error) {
      console.error('Tip failed:', error);
      alert('Tip failed, please try again later');
    }
  };

  return (
    <div className="skill-card" onClick={() => router.push(`/skill/${skill.id}`)}>
      {/* 头部：平台 + 创作者 */}
      <div className="skill-card-header">
        <span className="skill-platform-pill">
          {skill.platform}
        </span>
        <span className="skill-creator" title={skill.payment_address}>
          {shortenAddress(skill.payment_address)}
        </span>
      </div>

      {/* 名称和描述 */}
      <h3 className="skill-title">{skill.name}</h3>
      <p className="skill-description">{skill.description}</p>

      {/* 外部链接 */}
      <div className="skill-links">
        {skill.npm_package && (
          <a
            href={`https://www.npmjs.com/package/${skill.npm_package}`}
            target="_blank"
            rel="noopener noreferrer"
            title="npm"
            aria-label="View on npm"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </a>
        )}
        {skill.repository && (
          <a
            href={skill.repository}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            aria-label="View on GitHub"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            </svg>
          </a>
        )}
        {skill.homepage && (
          <a
            href={skill.homepage}
            target="_blank"
            rel="noopener noreferrer"
            title="Homepage"
            aria-label="Visit homepage"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          </a>
        )}
      </div>

      {/* 统计数据 */}
      <div className="skill-stats">
        {(skill.download_count || 0) > 0 && (
          <span title="Downloads">{formatNumber(skill.download_count || 0)}</span>
        )}
        {(skill.github_stars || 0) > 0 && (
          <span title="GitHub Stars">{formatNumber(skill.github_stars || 0)} ⭐</span>
        )}
        {(skill.github_forks || 0) > 0 && (
          <span title="GitHub Forks">{formatNumber(skill.github_forks || 0)}</span>
        )}
        {(skill.platform_likes || 0) > 0 && (
          <span title="Likes">{formatNumber(skill.platform_likes || 0)}</span>
        )}
        <span title="Total Tips" className="skill-tips">
          {formatTips(skill.total_tips)} ASKL
        </span>
      </div>

      {/* 打赏按钮 */}
      <button
        onClick={handleTip}
        disabled={isPending}
        className="skill-tip-button"
      >
        {isPending ? (
          <>
            <svg
              className="skill-tip-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <svg
              className="skill-tip-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="8" r="6" />
              <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
              <path d="M7 6h1v4" />
              <path d="m16.71 13.88.7.71-2.82 2.82" />
            </svg>
            <span>Tip</span>
          </>
        )}
      </button>

      {/* 安装按钮 */}
      <SkillInstallButton skill={skill} />
    </div>
  );
}
