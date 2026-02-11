#!/bin/bash
#
# Docker 本地构建和测试脚本
#

set -e

# 颜色输出
log_info() { echo -e "\033[0;32mℹ️  $1\033[0m"; }
log_success() { echo -e "\033[0;32m✅  $1\033[0m"; }
log_error() { echo -e "\033[0;31m❌  $1\033[0m"; }

# 默认值
IMAGE_NAME="myskills-frontend"
IMAGE_TAG="latest"
CONTAINER_NAME="myskills-test"
PORT=3001

# 解析参数
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --tag) IMAGE_TAG="$2"; shift ;;
        --port) PORT="$2"; shift ;;
        --no-cache) NO_CACHE="--no-cache"; ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

log_info "开始 Docker 构建流程..."
echo ""

# Step 1: 构建 Docker 镜像
log_info "Step 1/4: 构建 Docker 镜像"
docker build \
    -t "$FULL_IMAGE" \
    -f frontend/Dockerfile \
    $NO_CACHE \
    ./frontend

if [ $? -eq 0 ]; then
    log_success "镜像构建成功: $FULL_IMAGE"
else
    log_error "镜像构建失败"
    exit 1
fi

# Step 2: 停止并删除旧容器（如果存在）
log_info "Step 2/4: 清理旧容器"
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME
    log_success "已删除旧容器"
fi

# Step 3: 运行新容器
log_info "Step 3/4: 启动测试容器"
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:3000 \
    -e NEXT_PUBLIC_ASKL_TOKEN_ADDRESS=0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A \
    -e NODE_ENV=production \
    $FULL_IMAGE

if [ $? -eq 0 ]; then
    log_success "容器启动成功"
else
    log_error "容器启动失败"
    exit 1
fi

# Step 4: 等待并测试
log_info "Step 4/4: 健康检查"
sleep 5

if curl -f http://localhost:$PORT > /dev/null 2>&1; then
    log_success "应用运行正常！"
    echo ""
    echo "================================"
    log_success "本地测试地址："
    echo "  http://localhost:$PORT"
    echo ""
    echo "停止容器："
    echo "  docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
    echo "================================"
else
    log_error "应用未响应"
    echo "查看日志："
    echo "  docker logs $CONTAINER_NAME"
    exit 1
fi
