#!/bin/bash
################################################################################
# MySkills Protocol - Cron 任务设置脚本
# 每15分钟自动运行排练
################################################################################

set -euo pipefail

PROJECT_ROOT="/Volumes/Kingstone/workspace/rebel-agent-skills"
CRON_FILE="/tmp/myskills_rehearsal_cron"
REHEARSAL_SCRIPT="${PROJECT_ROOT}/demo/auto-rehearsal.sh"

echo "=========================================="
echo "MySkills Protocol - Cron 任务设置"
echo "=========================================="
echo ""

# ============================================================================
# 检查和准备
# ============================================================================

echo "📋 1. 检查脚本权限..."

if [ ! -f "$REHEARSAL_SCRIPT" ]; then
    echo "❌ 错误: 排练脚本不存在: $REHEARSAL_SCRIPT"
    exit 1
fi

# 确保脚本可执行
chmod +x "$REHEARSAL_SCRIPT"
echo "✅ 排练脚本权限已设置"

echo ""
echo "📋 2. 创建日志目录..."

mkdir -p "${PROJECT_ROOT}/demo/logs"
mkdir -p "${PROJECT_ROOT}/demo/screenshots"
echo "✅ 目录已创建"

echo ""
echo "📋 3. 生成 Cron 配置..."

# Cron 表达式: 每15分钟运行一次
# 格式: 分 时 日 月 周 命令
CRON_EXPRESSION="*/15 * * * *"

# 创建 cron 任务
cat > "$CRON_FILE" << EOF
# MySkills Protocol - 自动排练任务
# 每15分钟运行一次
${CRON_EXPRESSION} ${REHEARSAL_SCRIPT} >> ${PROJECT_ROOT}/demo/logs/cron.log 2>&1

# 每小时清理旧日志（保留最近7天）
0 * * * * find ${PROJECT_ROOT}/demo/logs -name "*.log" -mtime +7 -delete
EOF

echo "✅ Cron 配置已生成:"
cat "$CRON_FILE"

echo ""
echo "📋 4. 安装 Cron 任务..."

# 检查是否已存在
if crontab -l 2>/dev/null | grep -q "myskills\|auto-rehearsal"; then
    echo "⚠️  检测到已存在的 MySkills cron 任务"
    echo "正在备份当前 crontab..."
    crontab -l > "/tmp/crontab_backup_$(date +%Y%m%d_%H%M%S)"

    echo "移除旧任务..."
    crontab -l 2>/dev/null | grep -v "myskills\|auto-rehearsal" > /tmp/temp_crontab || true
    crontab /tmp/temp_crontab 2>/dev/null || true
fi

# 添加新任务
crontab -l 2>/dev/null > /tmp/current_crontab || true
cat "$CRON_FILE" >> /tmp/current_crontab
crontab /tmp/current_crontab

echo "✅ Cron 任务已安装"

echo ""
echo "📋 5. 验证安装..."

echo "当前 crontab 内容:"
crontab -l | grep -E "myskills|auto-rehearsal|MySkills"

echo ""
echo "=========================================="
echo "✅ 设置完成!"
echo "=========================================="
echo ""
echo "📅 Cron 任务信息:"
echo "  - 运行频率: 每15分钟"
echo "  - 下次运行: $(date -v +15M '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -d '+15 minutes' '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo '15分钟后')"
echo "  - 日志目录: ${PROJECT_ROOT}/demo/logs"
echo "  - 截图目录: ${PROJECT_ROOT}/demo/screenshots"
echo ""
echo "🔧 管理命令:"
echo "  - 查看日志: tail -f ${PROJECT_ROOT}/demo/logs/rehearsal_*.log"
echo "  - 查看截图: ls -la ${PROJECT_ROOT}/demo/screenshots/"
echo "  - 手动运行: ${REHEARSAL_SCRIPT}"
echo "  - 删除任务: crontab -e (删除相关行)"
echo ""
echo "💡 提示:"
echo "  - 首次运行会启动开发服务器"
echo "  - 后续运行会复用已运行的服务器"
echo "  - 所有截图都会保存到 demo/screenshots/"
echo ""

# 可选: 立即运行一次测试
read -p "是否立即运行一次测试? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 运行测试..."
    "${REHEARSAL_SCRIPT}"
fi

# 清理临时文件
rm -f "$CRON_FILE" /tmp/temp_crontab /tmp/current_crontab
