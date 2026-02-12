#!/bin/bash

# Continuous work script for pitch deck implementation
# This script will continuously analyze and implement pitch deck features

LOG_FILE="pitch-work-log.txt"

最新进展（2026-02-12）：
✅ Skills已连接真实API - frontend/app/demo-moltiverse/page.tsx已更新：
   - 添加Skill接口定义
   - 添加skills state和loading/error states
   - 添加useEffect从/api/skills获取数据
   - 更新Skills展示使用真实API数据
   - 支持logo_url、verified、tags、creator_address等

下一步任务：
1. 添加过滤UI（按平台、分类、创建者）
2. 添加排序功能（tips/stars/likes/date切换）
3. 实现技能详情模态框或跳转
4. 添加技术栈对比卡片（前端+数据库 vs 后端+API）
5. 添加Agent Economy详细说明
6. 添加竞争优势对比（vs npm/GitHub）
7. 添加团队介绍

参考：
- Live Demo: https://myskills2026.ddttupupo.buzz
- Pitch vA: pitch/moltiverse-hackathon-vA.html (12页完整）
- Pitch vB: pitch/moltiverse-hackathon-vB.html (8页精简）
- 实现计划: IMPLEMENTATION_PLAN.md
- 代码更改： git log --oneline -5 feat/moltiverse-openclaw

echo "=== 开始持续工作循环 ===" | tee -a "$LOG_FILE"
echo "开始时间: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

while true; do
    echo "========================================" | tee -a "$LOG_FILE"
    echo "新循环: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # 调用Claude进行工作
    echo "正在调用Claude..." | tee -a "$LOG_FILE"
    claude --dangerously-skip-permissions -p "持续分析feat/moltiverse-openclaw分支代码，对比live demo和pitch deck目标，识别差距并实现缺失功能。" >> "$LOG_FILE" 2>&1

    # 检查上一次调用的结果
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
        echo "✓ Claude工作成功完成" | tee -a "$LOG_FILE"
    else
        echo "✗ Claude工作遇到错误 (exit code: $EXIT_CODE)" | tee -a "$LOG_FILE"
    fi

    # 等待一段时间再继续
    echo "" | tee -a "$LOG_FILE"
    echo "等待30秒后继续..." | tee -a "$LOG_FILE"
    sleep 30
done
