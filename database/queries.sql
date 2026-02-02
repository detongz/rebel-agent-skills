-- 常用 SQL 查询示例

-- ============================================
-- 1. Skills 查询
-- ============================================

-- 获取所有活跃的 Skills，按打赏量排序
SELECT
  id,
  name,
  platform,
  payment_address,
  total_tips / 1e18 AS total_tips_askl,  -- 转换单位
  tip_count,
  platform_likes,
  github_stars,
  download_count,
  created_at
FROM skills
WHERE status = 'active'
ORDER BY total_tips DESC
LIMIT 20;

-- 按平台筛选 Skills
SELECT * FROM skills
WHERE platform = 'coze' AND status = 'active'
ORDER BY platform_likes DESC;

-- 搜索 Skills（按名称或描述）
SELECT * FROM skills
WHERE status = 'active'
  AND (
    name ILIKE '%copilot%' OR
    description ILIKE '%copilot%'
  )
ORDER BY github_stars DESC;

-- 获取某个创作者的所有 Skills
SELECT
  name,
  platform,
  total_tips / 1e18 AS total_tips,
  platform_likes,
  created_at
FROM skills
WHERE creator_address = '0x1234567890abcdef1234567890abcdef12345678'
  AND status = 'active'
ORDER BY created_at DESC;

-- 获取热门 Skills（近7天）
SELECT
  s.id,
  s.name,
  s.platform,
  s.total_tips / 1e18 AS total_tips,
  s.tip_count,
  COUNT(t.id) AS recent_tips
FROM skills s
LEFT JOIN tips t ON t.skill_id = s.skill_id
  AND t.created_at > NOW() - INTERVAL '7 days'
WHERE s.status = 'active'
GROUP BY s.id
ORDER BY recent_tips DESC, s.total_tips DESC
LIMIT 20;

-- ============================================
-- 2. 打赏记录查询
-- ============================================

-- 获取某个 Skill 的打赏记录
SELECT
  t.from_address,
  t.amount / 1e18 AS amount,
  t.creator_received / 1e18 AS creator_received,
  t.message,
  t.created_at
FROM tips t
WHERE t.skill_id = '\x...skill_id_bytes...'  -- 替换为实际 skill_id
ORDER BY t.created_at DESC
LIMIT 50;

-- 获取用户的打赏历史
SELECT
  s.name AS skill_name,
  t.amount / 1e18 AS amount,
  t.created_at
FROM tips t
LEFT JOIN skills s ON s.skill_id = t.skill_id
WHERE t.from_address = '0x...'
ORDER BY t.created_at DESC;

-- 获取创作者的收益历史
SELECT
  s.name AS skill_name,
  t.creator_received / 1e18 AS received,
  t.created_at
FROM tips t
LEFT JOIN skills s ON s.skill_id = t.skill_id
WHERE t.to_address = '0x...'
ORDER BY t.created_at DESC;

-- 统计：平台总打览量
SELECT
  COUNT(*) AS total_tips,
  SUM(amount) / 1e18 AS total_amount_askl,
  SUM(platform_fee) / 1e18 AS total_burned_askl,
  AVG(amount) / 1e18 AS avg_tip_amount
FROM tips;

-- ============================================
-- 3. 创作者排行榜
-- ============================================

-- 按总收益排行
SELECT
  payment_address,
  COUNT(*) AS skill_count,
  SUM(total_tips) / 1e18 AS total_earnings,
  SUM(tip_count) AS total_tips_received
FROM skills
WHERE status = 'active'
GROUP BY payment_address
ORDER BY total_earnings DESC
LIMIT 100;

-- ============================================
-- 4. 统计更新相关
-- ============================================

-- 查找需要更新统计数据的 Skills
SELECT
  id,
  name,
  npm_package,
  repository,
  stats_updated_at,
  NOW() - stats_updated_at AS time_since_update
FROM skills
WHERE status = 'active'
  AND (
    npm_package IS NOT NULL OR
    repository IS NOT NULL
  )
ORDER BY stats_updated_at ASC NULLS FIRST;

-- 获取统计数据更新失败的记录
SELECT
  entity_type,
  entity_id,
  update_type,
  error_message,
  created_at
FROM stats_update_log
WHERE success = false
ORDER BY created_at DESC
LIMIT 50;

-- ============================================
-- 5. 水龙头相关
-- ============================================

-- 检查用户是否可以领取水龙头
SELECT
  address,
  amount / 1e18 AS amount_received,
  created_at,
  CASE
    WHEN created_at > NOW() - INTERVAL '24 hours' THEN false
    ELSE true
  END AS can_claim
FROM faucet_claim
WHERE address = '0x...'
ORDER BY created_at DESC
LIMIT 1;

-- 统计水龙头发放情况
SELECT
  COUNT(*) AS total_claims,
  SUM(amount) / 1e18 AS total_distributed,
  COUNT(DISTINCT address) AS unique_addresses,
  NOW() - MAX(created_at) AS time_since_last_claim
FROM faucet_claim;

-- ============================================
-- 6. 数据维护
-- ============================================

-- 清理测试数据（开发用）
-- DELETE FROM tips WHERE created_at < NOW() - INTERVAL '7 days';
-- DELETE FROM skills WHERE status = 'deleted';

-- 重置某个 Skill 的统计数据
UPDATE skills
SET
  download_count = 0,
  github_stars = 0,
  github_forks = 0,
  stats_updated_at = NULL
WHERE id = <skill_id>;

-- 重新计算 Skills 的 total_tips（从 tips 表聚合）
UPDATE skills s
SET total_tips = COALESCE((
  SELECT SUM(creator_received)
  FROM tips
  WHERE skill_id = s.skill_id
), 0),
tip_count = COALESCE((
  SELECT COUNT(*)
  FROM tips
  WHERE skill_id = s.skill_id
), 0);

-- ============================================
-- 7. 数据导出
-- ============================================

-- 导出所有 Skills（用于备份）
COPY (
  SELECT
    id,
    encode(skill_id, 'hex') AS skill_id_hex,
    name,
    description,
    platform,
    version,
    creator_address,
    payment_address,
    npm_package,
    repository,
    homepage,
    total_tips,
    tip_count,
    platform_likes,
    github_stars,
    download_count,
    status,
    created_at
  FROM skills
  WHERE status = 'active'
) TO '/tmp/skills_export.csv' WITH CSV HEADER;

-- 导出打赏记录
COPY (
  SELECT
    encode(tx_hash, 'hex') AS tx_hash,
    encode(skill_id, 'hex') AS skill_id,
    from_address,
    to_address,
    amount / 1e18 AS amount,
    creator_received / 1e18 AS creator_received,
    platform_fee / 1e18 AS platform_fee,
    created_at
  FROM tips
  ORDER BY created_at DESC
) TO '/tmp/tips_export.csv' WITH CSV HEADER;
