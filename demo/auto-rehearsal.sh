#!/bin/bash
################################################################################
# MySkills Protocol - 自动排练脚本 (每15分钟运行)
# 用于演示张老师的 use case: Agent 发现、雇佣、支付其他 Agent
################################################################################

set -euo pipefail

# ============================================================================
# 配置
# ============================================================================

PROJECT_ROOT="/Volumes/Kingstone/workspace/rebel-agent-skills"
LOG_DIR="${PROJECT_ROOT}/demo/logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/rehearsal_${TIMESTAMP}.log"
PID_FILE="${PROJECT_ROOT}/demo/rehearsal.pid"

# 确保日志目录存在
mkdir -p "${LOG_DIR}"

# ============================================================================
# 日志函数
# ============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info() { log "INFO" "$@"; }
log_success() { log "SUCCESS" "$@"; }
log_warning() { log "WARNING" "$@"; }
log_error() { log "ERROR" "$@"; }

# ============================================================================
# 检查依赖
# ============================================================================

check_dependencies() {
    log_info "检查依赖..."

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi

    # 检查 npx
    if ! command -v npx &> /dev/null; then
        log_error "npx 未安装"
        exit 1
    fi

    log_success "依赖检查通过"
}

# ============================================================================
# 检查端口占用
# ============================================================================

check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "端口 $port 已被占用"
        return 1
    fi
    return 0
}

# ============================================================================
# 启动前端开发服务器
# ============================================================================

start_dev_server() {
    log_info "检查前端开发服务器状态..."

    if check_port 3000; then
        log_info "启动前端开发服务器 (端口 3000)..."
        cd "${PROJECT_ROOT}/frontend"

        # 后台启动开发服务器
        nohup npm run dev > "${LOG_DIR}/dev_server_${TIMESTAMP}.log" 2>&1 &
        DEV_SERVER_PID=$!
        echo $DEV_SERVER_PID > "${PROJECT_ROOT}/demo/dev_server.pid"

        # 等待服务器启动
        local max_wait=30
        local waited=0
        while [ $waited -lt $max_wait ]; do
            if curl -s http://localhost:3000 > /dev/null 2>&1; then
                log_success "前端开发服务器已启动 (PID: $DEV_SERVER_PID)"
                return 0
            fi
            sleep 1
            waited=$((waited + 1))
        done

        log_error "前端开发服务器启动超时"
        return 1
    else
        log_info "前端开发服务器已在运行"
        return 0
    fi
}

# ============================================================================
# 停止前端开发服务器
# ============================================================================

stop_dev_server() {
    local pid_file="${PROJECT_ROOT}/demo/dev_server.pid"
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            log_info "停止前端开发服务器 (PID: $pid)..."
            kill $pid
            rm -f "$pid_file"
            log_success "前端开发服务器已停止"
        fi
    fi
}

# ============================================================================
# 运行 Playwright 排练
# ============================================================================

run_playwright_rehearsal() {
    log_info "开始 Playwright 排练..."

    cd "${PROJECT_ROOT}"

    # 运行排练脚本
    if npx tsx demo/zhang-usecase-rehearsal.ts >> "${LOG_FILE}" 2>&1; then
        log_success "Playwright 排练完成"
        return 0
    else
        log_error "Playwright 排练失败"
        return 1
    fi
}

# ============================================================================
# 主函数
# ============================================================================

main() {
    # 检查是否已有实例在运行
    if [ -f "$PID_FILE" ]; then
        local old_pid=$(cat "$PID_FILE")
        if kill -0 $old_pid 2>/dev/null; then
            log_warning "排练脚本已在运行 (PID: $old_pid)"
            exit 0
        fi
        rm -f "$PID_FILE"
    fi

    # 记录当前进程 PID
    echo $$ > "$PID_FILE"

    log_info "=========================================="
    log_info "MySkills 自动排练开始"
    log_info "=========================================="

    # 设置退出时清理
    trap 'log_info "清理资源..."; rm -f "$PID_FILE";' EXIT

    # 检查依赖
    check_dependencies

    # 启动开发服务器（如果需要）
    start_dev_server

    # 运行 Playwright 排练
    if run_playwright_rehearsal; then
        log_success "=========================================="
        log_success "排练成功完成!"
        log_success "=========================================="
        exit 0
    else
        log_error "=========================================="
        log_error "排练失败!"
        log_error "=========================================="
        exit 1
    fi
}

# ============================================================================
# 执行
# ============================================================================

main "$@"
