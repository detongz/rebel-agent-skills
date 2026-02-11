#!/bin/bash
#
# MySkills Server 快速部署脚本
# 用于 GitHub Actions 自动部署到服务器
#

set -e  # 遇到错误时退出

# ========================================
# 服务器配置（用户已提供）
# ========================================

DEPLOY_HOST="107.174.147.10:22"
DEPLOY_PATH="/var/www/myskills2026"

# 端口配置 - 前端使用 107 端口
API_PORT=3000
FRONTEND_PORT=107

# PM2 应用名称
PM2_APP_NAME="myskills2026"

# ========================================
# 颜色输出
# ========================================

log_info() {
    echo -e "\033[0;32mℹ️  $1\033[0m"
}

log_success() {
    echo -e "\033[0;32m✅  $1\033[0m"
}

log_error() {
    echo -e "\033[0;31m❌  $1\033[0m"
}

log_step() {
    echo -e "\033[0;36m▶  $1\033[0m"
}

# ========================================
# 快速部署
# ========================================

quick_deploy() {
    log_info "开始快速部署..."
    log_step "1/5: 本地构建包"

    # 设置基础目录
    local BASE_DIR="/Volumes/Kingstone/workspace/rebel-agent-skills"
    cd "$BASE_DIR"

    # 构建共享包
    echo "  → 构建共享包..."
    (cd packages/shared && npm run build)
    if [ $? -ne 0 ]; then
        log_error "  ✗ 共享包构建失败"
        return 1
    fi
    echo "  ✅ @myskills/shared built"

    # 构建前端
    echo "  → 构建前端..."
    (cd frontend && npm run build)
    if [ $? -ne 0 ]; then
        log_error "  ✗ 前端构建失败"
        return 1
    fi
    echo "  ✅ Frontend built"

    # 构建并打包 CLI
    echo "  → 构建并打包 CLI..."
    (cd packages/cli && npm run build && npm run pack) 2>/dev/null
    CLI_TGZ=$(ls packages/cli/dist/myskills-cli-*.tgz 2>/dev/null | head -1)
    if [ -z "$CLI_TGZ" ]; then
        log_error "  ✗ CLI 打包失败"
        return 1
    fi
    echo "  ✅ CLI built and packed"

    log_step "2/5: 上传文件到服务器"

    # 在服务器上创建临时目录
    ssh "$DEPLOY_HOST" "mkdir -p $DEPLOY_PATH/temp"

    # 上传共享包
    echo "     → 上传 @myskills/shared..."
    tar -czf - packages/shared/dist | ssh "$DEPLOY_HOST" "tar -xzf - -C $DEPLOY_PATH/temp" 2>&1
    if [ $? -eq 0 ]; then
        echo "       ✅ 上传成功"
    else
        echo "       ❌ 上传失败"
    fi

    # 上传前端
    echo "     → 上传 frontend..."
    tar -czf - frontend/.next | ssh "$DEPLOY_HOST" "tar -xzf - -C $DEPLOY_PATH/temp" 2>&1
    if [ $? -eq 0 ]; then
        echo "       ✅ 上传成功"
    else
        echo "       ❌ 上传失败"
    fi

    # 上传 CLI
    echo "     → 上传 CLI..."
    scp "$CLI_TGZ" "$DEPLOY_HOST:$DEPLOY_PATH/temp/" 2>&1
    if [ $? -eq 0 ]; then
        echo "       ✅ 上传成功"
    else
        echo "       ❌ 上传失败"
    fi

    echo "     → 文件上传完成"

    log_step "3/5: 部署文件"

    # 移动文件到目标位置
    ssh "$DEPLOY_HOST" "
        cd $DEPLOY_PATH

        # 停止旧服务（使用 PM2）
        if command -v pm2 &> /dev/null; then
            pm2 stop $PM2_APP_NAME --wait 5 2>/dev/null || true
            echo "       → PM2 已停止"
        fi

        # 更新前端
        rm -rf frontend
        mv temp/frontend frontend

        # 更新 shared
        rm -rf shared
        mv temp/shared shared

        # 解压 CLI
        if [ -d "temp/cli" ]; then
            tar -xzf temp/cli/myskills-cli-*.tgz -C $APP_DIR/
            rm -rf temp/cli
        fi

        # 设置权限
        chown -R www-data:www-data $DEPLOY_PATH
        chmod -R 755 $DEPLOY_PATH

        echo "       → 文件部署完成"
    "

    if [ $? -ne 0 ]; then
        log_error "  ✗ 文件部署失败"
        return 1
    fi

    log_success "     ✅ 文件部署完成"

    log_step "4/5: 重启服务"

    # 重启服务
    ssh "$DEPLOY_HOST" "
        cd $DEPLOY_PATH

        # 启动 API（后台模式）
        if [ -d "shared/node_modules/.bin/myskills-api" ]; then
            nohup node shared/node_modules/.bin/myskills-api > api.log 2>&1 &
            echo "       → API 已启动"
        fi

        # 启动前端（端口 107）
        if [ -d "frontend/node_modules/.bin/next-server" ]; then
            # 设置环境变量指定端口
            PORT=$FRONTEND_PORT nohup node frontend/node_modules/.bin/next-server > frontend.log 2>&1 &
            echo "       → 前端已启动（端口 $FRONTEND_PORT）"
        fi

        # 等待服务启动
        sleep 5

        echo "       → 服务重启完成"
    "

    if [ $? -ne 0 ]; then
        log_error "  ✗ 服务重启失败"
        return 1
    fi

    log_success "     ✅ 服务重启完成"

    log_step "5/5: 健康检查"

    # 等待服务启动
    sleep 10

    # 检查 API 端口
    if curl -f http://$DEPLOY_HOST:$API_PORT/api/health 2>/dev/null; then
        echo "       → API 正常"
    else
        echo "       → API 异常"
    fi

    # 检查前端端口（107）
    if curl -f http://$DEPLOY_HOST:$FRONTEND_PORT/ 2>/dev/null; then
        echo "       → 前端正常"
    else
        echo "       → 前端异常"
    fi

    log_success "     ✅ 健康检查完成"

    log_success ''
    log_info '访问地址：'
    log_info '  前端: http://$DEPLOY_HOST:$FRONTEND_PORT'
    log_info '  API: http://$DEPLOY_HOST:$API_PORT/api/health'
    log_success ''
    log_success '下一步：'
    log_info '  本地测试: curl http://$DEPLOY_HOST:$FRONTEND_PORT'
    log_success '  或等待 GitHub Actions 自动部署完成（约 3-5 分钟）'
}

# ========================================
# 显示使用说明
# ========================================

show_usage() {
    cat << 'EOF'

MySkills Server - 快速部署脚本
====================================

用法: ./quick-deploy.sh [选项]

选项:
  -h, --help     显示此帮助信息

命令:
  deploy          执行完整部署流程

示例:
  ./quick-deploy.sh

环境变量:
  FRONTEND_PORT=107  # 前端端口（默认）

部署后访问:
  前端: http://$DEPLOY_HOST:$FRONTEND_PORT
  API: http://$DEPLOY_HOST:$API_PORT/api/health

EOF
}

# ========================================
# 命令行参数处理
# ========================================

case "$1" in
    -h|--help)
        show_usage
        exit 0
        ;;
    *)
        # 执行快速部署
        quick_deploy
        exit $?
        ;;
esac
