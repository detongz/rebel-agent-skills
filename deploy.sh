#!/bin/bash
#
# MySkills Server 部署脚本
# 用于 GitHub Actions 自动部署到服务器
#

set -e  # 遇到错误时退出

# ========================================
# 配置
# ========================================

# 应用目录（根据实际服务器路径修改）
APP_DIR="/var/www/myskills2026"
FRONTEND_DIR="$APP_DIR/frontend"
CLI_DIR="$APP_DIR/cli"
SHARED_DIR="$APP_DIR/shared"
BACKUP_DIR="$APP_DIR/backup"

# PM2 应用名称
PM2_APP_NAME="myskills2026"

# 端口配置 - ⚠️ 前端使用 107 端口
API_PORT=3000
FRONTEND_PORT=107  # 前端使用 107 端口（通过 Nginx 反向代理或直接监听）

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

log_warning() {
    echo -e "\033[0;33m⚠️  $1\033[0m"
}

# ========================================
# 部署函数
# ========================================

# 检查服务器连接
check_server() {
    log_info "检查服务器连接..."

    if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$DEPLOY_HOST" "echo 'alive' > /dev/null" 2>/dev/null; then
        log_success "服务器连接正常"
        return 0
    else
        log_error "无法连接到服务器"
        return 1
    fi
}

# 备份现有文件
backup_existing() {
    log_info "备份现有文件..."

    ssh "$DEPLOY_HOST" "
        mkdir -p $BACKUP_DIR
        cd $APP_DIR

        # 备份现有文件
        if [ -d "frontend" ]; then
            tar -czf $BACKUP_DIR/frontend-$(date +%Y%m%d%H%M%S).tar.gz frontend 2>/dev/null || true
        fi

        if [ -d "cli" ]; then
            tar -czf $BACKUP_DIR/cli-$(date +%Y%m%d%H%M%S).tar.gz cli 2>/dev/null || true
        fi

        if [ -d "shared" ]; then
            tar -czf $BACKUP_DIR/shared-$(date +%Y%m%d%H%M%S).tar.gz shared 2>/dev/null || true
        fi

        # 清理旧备份（保留最近7天）
        cd $BACKUP_DIR
        ls -t frontend-*.tar.gz | tail -n +8 | xargs -I {} rm -f
        ls -t cli-*.tar.gz | tail -n +8 | xargs -I {} rm -f
        ls -t shared-*.tar.gz | tail -n +8 | xargs -I {} rm -f

        log_success "备份完成（已保留最近7天）"
        return 0
    else
        log_error "备份失败"
        return 1
    fi
}

# 上传并部署
deploy_files() {
    log_info "开始部署..."

    # 在本地先构建所有包
    echo "🔨 Building packages..."
    cd /Volumes/Kingstone/workspace/rebel-agent-skills

    # 构建共享包
    echo "  → Building @myskills/shared..."
    cd packages/shared && npm run build
    if [ $? -ne 0 ]; then
        log_error "Shared package build failed"
        return 1
    fi
    echo "  ✅ @myskills/shared built"

    # 构建前端
    echo "  → Building frontend..."
    cd ../frontend && npm run build
    if [ $? -ne 0 ]; then
        log_error "Frontend build failed"
        return 1
    fi
    echo "  ✅ Frontend built"

    # 构建并打包 CLI
    echo "  → Building CLI..."
    cd ../packages/cli
    npm run build
    npm run pack 2>/dev/null || true

    if [ ! -f "dist/myskills-cli-*.tgz" ]; then
        log_error "CLI package failed"
        return 1
    fi
    echo "  ✅ CLI built and packed"

    # 在服务器上创建临时目录
    log_info "上传文件到服务器..."
    ssh "$DEPLOY_HOST" "
        mkdir -p $APP_DIR/temp

        # 上传共享包
        echo '  → Uploading @myskills/shared...'
        tar -czf - packages/shared/dist | ssh $DEPLOY_HOST 'tar -xzf -C $APP_DIR/temp' 2>&1
        if [ $? -eq 0 ]; then
            echo '  ✅ @myskills/shared uploaded'
        else
            echo '  ❌ @myskills/shared upload failed'
        fi

        # 上传前端构建
        echo '  → Uploading frontend...'
        tar -czf - ../frontend/.next | ssh $DEPLOY_HOST 'tar -xzf -C $APP_DIR/temp/frontend' 2>&1
        if [ $? -eq 0 ]; then
            echo '  ✅ Frontend uploaded'
        else
            echo '  ❌ Frontend upload failed'
        fi

        # 上传 CLI
        echo '  → Uploading CLI...'
        scp dist/myskills-cli-*.tgz $DEPLOY_HOST:$APP_DIR/temp/ 2>&1
        if [ $? -eq 0 ]; then
            echo '  ✅ CLI uploaded'
        else
            echo '  ❌ CLI upload failed'
        fi

        # 移动文件到目标位置
        cd $APP_DIR

        # 停止旧服务（使用 PM2）
        if command -v pm2 &> /dev/null; then
            pm2 stop $PM2_APP_NAME --wait 5 2>/dev/null || true
            log_success "PM2 进程已停止"
        fi

        # 更新 frontend
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
        chown -R www-data:www-data $APP_DIR
        chmod -R 755 $APP_DIR

        log_success "文件部署完成"
        return 0
    else
        log_error "文件上传失败"
        return 1
    fi
}

# 重启服务
restart_services() {
    log_info "重启服务..."

    ssh "$DEPLOY_HOST" "
        cd $APP_DIR

        # 启动 API（后台模式）
        if [ -d "shared/node_modules/.bin/myskills-api" ]; then
            nohup node shared/node_modules/.bin/myskills-api > api.log 2>&1 &
            echo '  ✅ API started on port '$API_PORT''
        fi

        # 启动前端（端口 107）⚠️
        if [ -d "frontend/node_modules/.bin/next-server" ]; then
            # 设置环境变量指定端口
            PORT=$FRONTEND_PORT nohup node frontend/node_modules/.bin/next-server > frontend.log 2>&1 &
            echo '  ✅ Frontend started on port '$FRONTEND_PORT''
        fi

        # 等待服务启动
        sleep 5

        # 使用 PM2 管理应用（如果安装）
        if command -v pm2 &> /dev/null; then
            pm2 restart $PM2_APP_NAME --update-env

            # 添加到 PM2
            pm2 start $PM2_APP_NAME --env "NODE_ENV=production"

            log_success 'PM2 应用已重启'
        else
            log_warning 'PM2 未安装，服务已手动启动'
        fi

        return 0
    else
        log_error '服务重启失败'
        return 1
    fi
}

# 健康检查
health_check() {
    log_info '执行健康检查...'

    # 等待服务启动
    sleep 10

    # 检查 API 端口
    if curl -f http://$DEPLOY_HOST:$API_PORT/api/health 2>/dev/null; then
        log_success "API 健康检查通过"
    else
        log_error "API 健康检查失败"
        return 1
    fi

    # 检查前端端口（107）
    if curl -f http://$DEPLOY_HOST:$FRONTEND_PORT/ 2>/dev/null; then
        log_success "Frontend 健康检查通过（端口 $FRONTEND_PORT）"
    else
        log_error "Frontend 健康检查失败"
        return 1
    fi

    return 0
}

# 查看日志
view_logs() {
    log_info '查看最近日志...'

    ssh "$DEPLOY_HOST" "
        echo '=== API 日志（最后30行）==='
        tail -n 30 api.log 2>/dev/null || echo '日志文件不存在'

        echo ''
        echo '=== Frontend 日志（最后30行）==='
        tail -n 30 frontend.log 2>/dev/null || echo '日志文件不存在'
    "
}

# PM2 管理（可选）
pm2_manage() {
    local action=$1

    case "$1" in
        status)
            ssh "$DEPLOY_HOST" "pm2 list"
            ;;
        restart)
            ssh "$DEPLOY_HOST" "pm2 restart $PM2_APP_NAME"
            ;;
        stop)
            ssh "$DEPLOY_HOST" "pm2 stop $PM2_APP_NAME"
            ;;
        logs)
            ssh "$DEPLOY_HOST" "pm2 logs $PM2_APP_NAME --lines 100"
            ;;
        monit)
            ssh "$DEPLOY_HOST" "pm2 monit"
            ;;
        *)
            echo '用法: ./deploy.sh [command]'
            echo ''
            echo '命令:'
            echo '  status   - 查看 PM2 和服务状态'
            echo '  restart  - 重启应用'
            echo '  stop     - 停止应用'
            echo '  logs     - 查看应用日志'
            echo '  monit   - 查看系统监控状态'
            echo ''
            echo '高级命令:'
            echo '  deploy   - 执行完整部署'
            echo '  health   - 执行健康检查'
            echo '  backup   - 备份现有文件'
            echo '  view_logs - 查看服务日志'
            echo ''
            echo '环境变量:'
            echo '  FRONTEND_PORT='$FRONTEND_PORT'  # 前端端口（107）'
            echo '  API_PORT='$API_PORT'              # API 端口（3000）'
            echo '  DEPLOY_HOST=$DEPLOY_HOST'
            echo '  DEPLOY_PATH=$DEPLOY_PATH'
            return 1
            ;;
    esac
}

# ========================================
# 主流程
# ========================================

# 显示使用说明
show_usage() {
    cat << 'EOF'

MySkills 部署脚本
====================

用法: ./deploy.sh [选项]

选项:
  -h, --help     显示此帮助信息

命令:
  status          查看 PM2 和服务状态
  restart         重启应用服务
  stop            停止应用服务
  logs            查看应用日志
  monit           查看系统监控状态
  health          执行健康检查
  backup          备份现有文件
  deploy          执行完整部署流程
  view_logs       查看服务日志

示例:
  ./deploy.sh status
  ./deploy.sh restart
  ./deploy.sh health

环境变量:
  FRONTEND_PORT=107  # 前端端口（默认 107）
  API_PORT=3000         # API 端口（默认 3000）

EOF
}

# ========================================
# 命令行参数处理
# ========================================

while [[ "$#" -gt 0 ]]; do
    case "$1" in
        -h|--help)
            show_usage
            exit 0
            ;;
        status)
            if command -v pm2 &> /dev/null; then
                ssh "$DEPLOY_HOST" "pm2 list"
            else
                log_error "PM2 未安装，无法查看状态"
            fi
            exit $?
            ;;
        restart)
            restart_services
            exit $?
            ;;
        stop)
            if command -v pm2 &> /dev/null; then
                ssh "$DEPLOY_HOST" "pm2 stop $PM2_APP_NAME"
            else
                log_error "PM2 未安装，无法停止服务"
            fi
            exit $?
            ;;
        logs)
            view_logs
            exit $?
            ;;
        monit)
            pm2_manage
            ;;
        health)
            health_check
            exit $?
            ;;
        backup)
            backup_existing
            exit $?
            ;;
        deploy)
            # 执行完整部署流程
            check_server || exit 1
            backup_existing || exit 1
            deploy_files || exit 1
            restart_services || exit 1
            sleep 5
            health_check || exit 1

            log_success '================================'
            log_success '部署完成！'
            log_info '访问地址：'
            log_info '  前端: http://$DEPLOY_HOST:$FRONTEND_PORT'
            log_info '  API: http://$DEPLOY_HOST:$API_PORT/api/health'
            log_success ''
            exit 0
            ;;
        view_logs)
            view_logs
            exit $?
            ;;
        *)
            log_error "未知选项: $1"
            show_usage
            exit 1
            ;;
    esac
    shift
done

# 如果没有参数，显示使用说明
show_usage
