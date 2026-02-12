#!/bin/bash

# Continuous work script for pitch deck implementation
# This script will continuously analyze and implement pitch deck features

LOG_FILE="pitch-work-log.txt"
PROMPT="持续分析feat/moltiverse-openclaw分支代码，对比live demo和pitch deck目标，识别差距并实现缺失功能。

当前优先任务：
1. 连接Skills到真实API（替换DEMO_SKILLS）
2. 添加技术栈对比卡片
3. 添加Agent Economy说明
4. 添加竞争优势对比
5. 添加团队介绍

参考：
- Live Demo: https://myskills2026.ddttupupo.buzz
- Pitch vA: pitch/moltiverse-hackathon-vA.html (11-12页)
- Pitch vB: pitch/moltiverse-hackathon-vB.html (8页)
- 实现计划: IMPLEMENTATION_PLAN.md
"

echo "=== 开始持续工作循环 ===" | tee -a "$LOG_FILE"
echo "开始时间: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

while true; do
    echo "========================================" | tee -a "$LOG_FILE"
    echo "新循环: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # 调用Claude进行工作
    echo "正在调用Claude..." | tee -a "$LOG_FILE"
    claude --dangerously-skip-permissions -p "$PROMPT" >> "$LOG_FILE" 2>&1

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
