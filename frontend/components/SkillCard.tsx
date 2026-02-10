// components/SkillCard.tsx - Skill 卡片组件
'use client';

import { useState, useEffect } from 'react';
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
    average_rating?: number;
    review_count?: number;
  };
  onTipped?: () => void;
  showReviewButton?: boolean;
}

interface SkillReviews {
  average_rating: number;
  review_count: number;
}

export default function SkillCard({ skill, onTipped, showReviewButton = true }: SkillCardProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [reviews, setReviews] = useState<SkillReviews | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userCompute, setUserCompute] = useState(0);

  useEffect(() => {
    // Fetch reviews for this skill
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/skills/${skill.id}/reviews`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setReviews(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };

    // Fetch user's compute usage for this skill
    const fetchComputeUsage = async () => {
      if (!address) return;
      try {
        const res = await fetch(`/api/agents/${address}/compute`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data.skills) {
            const skillCompute = data.data.skills.find((s: any) => s.skill_id === skill.id);
            setUserCompute(skillCompute?.compute_used || 0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch compute usage:', error);
      }
    };

    fetchReviews();
    fetchComputeUsage();
  }, [skill.id, address]);

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

  const handleReviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReviewModal(true);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars += '★';
      else if (i === fullStars && hasHalf) stars += '½';
      else stars += '☆';
    }
    return stars;
  };

  return (
    <>
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

        {/* 评分显示 */}
        {reviews && reviews.review_count > 0 && (
          <div className="skill-rating-display">
            <span className="skill-stars">{renderStars(reviews.average_rating)}</span>
            <span className="skill-rating-value">{reviews.average_rating.toFixed(1)}</span>
            <span className="skill-review-count">({reviews.review_count} reviews)</span>
          </div>
        )}

        {/* 算力消耗徽章 */}
        {userCompute > 0 && (
          <div className="skill-compute-badge">
            <span>💻 {formatNumber(userCompute)} compute used</span>
          </div>
        )}

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

        {/* 操作按钮 */}
        <div className="skill-actions">
          {/* 评论按钮 */}
          {showReviewButton && isConnected && (
            <button
              onClick={handleReviewClick}
              className="skill-review-button"
              title="Write a review to earn airdrops"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9 27 9 27 14.74 12 2"/>
                <path d="M12 2l-3.09 6.26L2 9l9 9 9-9-6.91-6.26L12 2z"/>
              </svg>
              <span>Review</span>
            </button>
          )}

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
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="review-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h3>Review {skill.name}</h3>
              <button onClick={() => setShowReviewModal(false)} className="review-modal-close">×</button>
            </div>
            <div className="review-modal-body">
              <p className="review-modal-hint">Write a quality review to earn airdrops!</p>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  router.push(`/skill/${skill.id}#review`);
                }}
                className="primary-btn"
              >
                Go to Review Page →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
