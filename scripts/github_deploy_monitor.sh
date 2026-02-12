#!/bin/bash
#
# GitHub Actions 自动监控和修复脚本（调用 Claude Code）
# 每 10 分钟检查一次，失败则调用 Claude 修复并推送
#

set -e

REPO="detongz/rebel-agent-skills"
BRANCH="feat/moltiverse-openclaw"
WORK_DIR="/Volumes/Kingstone/workspace/rebel-agent-skills"
LOG_FILE="/tmp/github_deploy_monitor.log"
PROMPT_FILE="/tmp/claude_prompt.txt"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

get_latest_run() {
    curl -s "https://api.github.com/repos/$REPO/actions/runs?branch=$BRANCH&per_page=1" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if data.get('workflow_runs'):
    run = data['workflow_runs'][0]
    print(f\"{run['status']}|{run.get('conclusion', 'pending')}|{run['html_url']}|{run['id']}|{run['head_sha'][:7]}\")
else:
    print('unknown|unknown|||')
"
}

call_claude_to_fix() {
    local run_id=$1
    local failed_step=$2

    log "🤖 调用 Claude Code CLI 分析并修复..."

    # 创建 Claude prompt
    local prompt="GitHub Actions 部署失败了，请帮我分析并修复：

📋 失败信息：
- 仓库: detongz/rebel-agent-skills
- 分支: feat/moltiverse-openclaw
- Run ID: $run_id
- 失败步骤: $failed_step
- 详情: https://github.com/detongz/rebel-agent-skills/actions/runs/$run_id

请：
1. 检查 $WORK_DIR/.github/workflows/deploy.yml 文件
2. 检查 $WORK_DIR/frontend/package.json 依赖
3. 分析失败原因
4. 修复代码
5. 提交并推送到 feat/moltiverse-openclaw 分支

修复完成后告诉我。"

    # 调用 Claude Code CLI
    cd "$WORK_DIR"
    claude --dangerously-skip-permissions -p "$prompt" >> "$LOG_FILE" 2>&1

    log "✅ Claude 分析完成"
}

check_and_fix() {
    local run_info
    run_info=$(get_latest_run)
    IFS='|' read -r STATUS CONCLUSION URL RUN_ID SHA <<< "$run_info"

    log "🔍 检查状态: $STATUS | $CONCLUSION | $SHA"

    if [ "$STATUS" = "completed" ] && [ "$CONCLUSION" = "failure" ]; then
        log "❌ 构建失败，调用 Claude 分析..."

        # 获取失败的步骤
        local failed_step
        failed_step=$(curl -s "https://api.github.com/repos/$REPO/actions/runs/$RUN_ID/jobs" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for job in data.get('jobs', []):
    for step in job.get('steps', []):
        if step.get('conclusion') == 'failure':
            print(step['name'])
            exit(0)
print('unknown')
")

        log "🔴 失败步骤: $failed_step"

        # 调用 Claude 修复
        call_claude_to_fix "$RUN_ID" "$failed_step"

        # 等待 Claude 修复并推送
        log "⏳ 等待 5 分钟让 GitHub Actions 重新构建..."
        sleep 300

    elif [ "$STATUS" = "completed" ] && [ "$CONCLUSION" = "success" ]; then
        log "🎉 部署成功！"
        log "   提交: $SHA"
        log "   链接: $URL"
        return 0
    fi

    return 1
}

# 主循环
log "🚀 开始监控 GitHub Actions 部署"
log "   仓库: $REPO"
log "   分支: $BRANCH"
log "   检查间隔: 10 分钟"
log "   使用: Claude Code CLI"
log ""

while true; do
    if check_and_fix; then
        log "✅ 部署成功，退出监控"
        break
    fi

    log "⏳ 等待 10 分钟后再次检查..."
    sleep 600
done
