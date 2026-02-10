#!/bin/bash
################################################################################
# MySkills Protocol - 持续排练守护进程
# 每15分钟运行一次，直到手动停止
################################################################################

PROJECT_ROOT="/Volumes/Kingstone/workspace/rebel-agent-skills"
REHEARSAL_SCRIPT="${PROJECT_ROOT}/demo/auto-rehearsal.sh"
LOG_DIR="${PROJECT_ROOT}/demo/logs"
PID_FILE="${PROJECT_ROOT}/demo/daemon.pid"

# 创建日志目录
mkdir -p "${LOG_DIR}"

# 记录为守护进程
echo $$ > "${PID_FILE}"

log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] $*" | tee -a "${LOG_DIR}/daemon.log"
}

log "=========================================="
log "MySkills 排练守护进程启动"
log "=========================================="
log "PID: $$"
log "间隔: 15 分钟"
log "脚本: ${REHEARSAL_SCRIPT}"
log ""

# 清理函数
cleanup() {
    log ""
    log "=========================================="
    log "守护进程停止"
    log "=========================================="
    rm -f "${PID_FILE}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 主循环
while true; do
    log "=========================================="
    log "开始新一轮排练"
    log "=========================================="

    # 运行排练脚本
    if "${REHEARSAL_SCRIPT}"; then
        log "✅ 排练成功"
    else
        log "❌ 排练失败"
    fi

    log ""
    log "下次运行: $(date -v +15M '+%H:%M:%S' 2>/dev/null || date -d '+15 minutes' '+%H:%M:%S' 2>/dev/null)"
    log ""

    # 等待 15 分钟
    for i in {900..1}; do
        sleep 1
    done
done
