// components/SkillCard.tsx - Skill 卡片组件
interface SkillCardProps {
  skill: {
    id: number;
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
}

export default function SkillCard({ skill }: SkillCardProps) {
  const shortenAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const formatTips = (tips: string) => {
    const n = parseFloat(tips) / 1e18; // 转换为 ASKL 单位
    return formatNumber(n);
  };

  return (
    <div className="border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
      {/* 头部：平台 + 创作者 */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm capitalize border border-purple-500/20">
          {skill.platform}
        </span>
        <span className="text-sm text-gray-500 font-mono" title={skill.payment_address}>
          👤 {shortenAddress(skill.payment_address)}
        </span>
      </div>

      {/* 名称和描述 */}
      <h3 className="text-lg font-bold mb-2 text-white">{skill.name}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">{skill.description}</p>

      {/* 外部链接 */}
      <div className="flex gap-3 mb-4 text-sm">
        {skill.npm_package && (
          <a
            href={`https://www.npmjs.com/package/${skill.npm_package}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 transition"
            title="npm"
          >
            📦
          </a>
        )}
        {skill.repository && (
          <a
            href={skill.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
            title="GitHub"
          >
            🐙
          </a>
        )}
        {skill.homepage && (
          <a
            href={skill.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition"
            title="官网"
          >
            🔗
          </a>
        )}
      </div>

      {/* 统计数据 */}
      <div className="flex items-center gap-3 text-xs text-gray-500 border-t border-gray-800 pt-4">
        {(skill.download_count || 0) > 0 && (
          <span title="下载量">📥 {formatNumber(skill.download_count || 0)}</span>
        )}
        {(skill.github_stars || 0) > 0 && (
          <span title="GitHub Stars">⭐ {formatNumber(skill.github_stars || 0)}</span>
        )}
        {(skill.github_forks || 0) > 0 && (
          <span title="GitHub Forks">🍴 {formatNumber(skill.github_forks || 0)}</span>
        )}
        {(skill.platform_likes || 0) > 0 && (
          <span title="点赞">👍 {formatNumber(skill.platform_likes || 0)}</span>
        )}
        <span title="累计打赏" className="font-semibold text-purple-400">
          💰 {formatTips(skill.total_tips)} ASKL
        </span>
      </div>

      {/* 打赏按钮 */}
      <button
        onClick={() => {/* TODO: 打赏功能 */}}
        className="w-full mt-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition text-sm"
      >
        打赏 💎
      </button>
    </div>
  );
}
