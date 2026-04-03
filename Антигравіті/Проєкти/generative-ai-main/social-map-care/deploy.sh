#!/bin/bash

set -euo pipefail

# ==============================================================================
# 🌌 ANTIGRAVITY PREMIUM DEPLOYMENT SYSTEM 🌌
# Проєкт: Social Map Care Premium
# Хостинг: соціальна-мапа-турботи.in.ua (CityHost/UkrHost)
# ==============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

load_env_file() {
    local env_file="$1"
    if [ -f "$env_file" ]; then
        # shellcheck disable=SC1090
        source "$env_file"
    fi
}

require_env() {
    local var_name="$1"
    if [ -z "${!var_name:-}" ]; then
        echo -e "${RED}❌ Відсутня обов'язкова змінна середовища: $var_name${NC}"
        exit 1
    fi
}

load_env_file ".env"
load_env_file ".env.local"

require_env "DEPLOY_HOST"
require_env "DEPLOY_USER"
require_env "DEPLOY_REMOTE_WWW"
require_env "DEPLOY_SSH_KEY_PATH"
require_env "DEPLOY_KNOWN_HOSTS_FILE"

if [ ! -f "$DEPLOY_SSH_KEY_PATH" ]; then
    echo -e "${RED}❌ Не знайдено SSH ключ: $DEPLOY_SSH_KEY_PATH${NC}"
    exit 1
fi

if [ ! -f "$DEPLOY_KNOWN_HOSTS_FILE" ]; then
    echo -e "${RED}❌ Не знайдено pinned known_hosts файл: $DEPLOY_KNOWN_HOSTS_FILE${NC}"
    exit 1
fi

HOST="$DEPLOY_HOST"
USER="$DEPLOY_USER"
REMOTE_WWW="$DEPLOY_REMOTE_WWW"
REMOTE_PARENT_DIR="$(dirname "$REMOTE_WWW")"
REMOTE_WWW_NAME="$(basename "$REMOTE_WWW")"
REMOTE_BACKUP_ROOT="${DEPLOY_REMOTE_BACKUP_ROOT:-$REMOTE_PARENT_DIR/_deploy_backups}"
BACKUP_KEEP_COUNT="${DEPLOY_BACKUP_KEEP_COUNT:-5}"
SSH_KEY_PATH="$DEPLOY_SSH_KEY_PATH"
KNOWN_HOSTS_FILE="$DEPLOY_KNOWN_HOSTS_FILE"
LOCAL_DIR=$(pwd)
BUILD_SHADOW="$LOCAL_DIR/.build_shadow"
ARCHIVE_NAME="smcp-deployment-$(date +%Y%m%d_%H%M).zip"
ARCHIVE="/tmp/$ARCHIVE_NAME"
BACKUP_STAMP="$(date +%Y%m%d_%H%M%S)"
SCP=(
    scp
    -i "$SSH_KEY_PATH"
    -o IdentitiesOnly=yes
    -o StrictHostKeyChecking=yes
    -o UserKnownHostsFile="$KNOWN_HOSTS_FILE"
)
SSH=(
    ssh
    -i "$SSH_KEY_PATH"
    -o IdentitiesOnly=yes
    -o StrictHostKeyChecking=yes
    -o UserKnownHostsFile="$KNOWN_HOSTS_FILE"
    -o BatchMode=yes
)

echo -e "${PURPLE}====================================================${NC}"
echo -e "${PURPLE}  🚀 SMCP PREMIUM AUTOMATIC DEPLOYMENT  🚀${NC}"
echo -e "${PURPLE}====================================================${NC}"

echo -e "${CYAN}[1/5] Перевірка локального середовища...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Помилка: Ви повинні знаходитись у корені проєкту!${NC}"
    exit 1
fi

if [ -f "scripts/mcp-version-checker.cjs" ]; then
    echo -e "${BLUE}  • Перевірка сумісності MCP систем...${NC}"
    node scripts/mcp-version-checker.cjs
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Помилка: Валідація версій MCP не пройшла. Деплой скасовано.${NC}"
        exit 1
    fi
fi

echo -e "${CYAN}[2/5] Оптимізована збірка (Static Export)...${NC}"
mkdir -p "$BUILD_SHADOW"

echo -e "${BLUE}  • Підготовка тимчасової директорії...${NC}"
rsync -a . "$BUILD_SHADOW/" \
    --exclude "node_modules" \
    --exclude ".next" \
    --exclude ".git" \
    --exclude ".npm" \
    --exclude ".cache" \
    --exclude ".build_shadow" \
    --exclude "*_old" \
    --exclude ".npm_*" \
    --exclude "google-cloud-sdk" \
    --exclude "venv" \
    --exclude "*.zip" \
    --exclude "deploy-*"

cd "$BUILD_SHADOW" || exit

rm -rf "$BUILD_SHADOW/app/api"

echo -e "${BLUE}  • Встановлення залежностей...${NC}"
npm install --legacy-peer-deps --no-audit --no-fund --quiet --cache .npm_cache

echo -e "${BLUE}  • Запуск збірки Next.js (Static Export)...${NC}"
NEXT_TELEMETRY_DISABLED=1 STATIC_EXPORT=1 NEXT_PUBLIC_AUTH_DISABLED=1 npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Помилка під час збірки! Деплой скасовано.${NC}"
    cd "$LOCAL_DIR"
    rm -rf "$BUILD_SHADOW"
    exit 1
fi

echo -e "${CYAN}[3/5] Створення релізного архіву...${NC}"
cd "$BUILD_SHADOW/out" || { echo -e "${RED}❌ Директорія out/ не знайдена!${NC}"; exit 1; }
find . -name ".DS_Store" -delete
find . -name "index.txt" -delete
zip -r "$ARCHIVE" .
if [ ! -f "$ARCHIVE" ]; then
    echo -e "${RED}❌ Архів не створено: $ARCHIVE${NC}"
    exit 1
fi
echo -e "${BLUE}  • Архів: $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))${NC}"
cd "$LOCAL_DIR"

echo -e "${CYAN}[4/5] Передача файлів на $HOST...${NC}"
"${SCP[@]}" "$ARCHIVE" "$USER@$HOST:~/"

echo -e "${CYAN}[5/5] Фіналізація на сервері...${NC}"
"${SSH[@]}" "$USER@$HOST" "
  echo '--- Початок операцій на сервері ---';
  mkdir -p '$REMOTE_BACKUP_ROOT/$REMOTE_WWW_NAME-$BACKUP_STAMP' &&
  printf '%s\n' 'Deny from all' > '$REMOTE_BACKUP_ROOT/.htaccess' &&
  find '$REMOTE_WWW' -mindepth 1 -maxdepth 1 -exec mv {} '$REMOTE_BACKUP_ROOT/$REMOTE_WWW_NAME-$BACKUP_STAMP/' \; &&
  unzip -o ~/$ARCHIVE_NAME -d '$REMOTE_WWW/' &&
  if [ -d '$REMOTE_BACKUP_ROOT' ]; then
    cd '$REMOTE_BACKUP_ROOT' &&
    ls -1dt ${REMOTE_WWW_NAME}-* 2>/dev/null | tail -n +$((BACKUP_KEEP_COUNT + 1)) | xargs -r rm -rf;
  fi &&
  rm ~/$ARCHIVE_NAME;
  echo '--- DEPLOY_SUCCESS ---'
"

cd "$LOCAL_DIR"
rm -rf "$BUILD_SHADOW" 2>/dev/null || { chmod -R u+w "$BUILD_SHADOW" && rm -rf "$BUILD_SHADOW"; }
rm -f "$ARCHIVE"

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}  ✨ ДЕПЛОЙ ЗАВЕРШЕНО УСПІШНО! ✨${NC}"
echo -e "${GREEN}  🌐 https://соціальна-мапа-турботи.in.ua${NC}"
echo -e "${GREEN}====================================================${NC}"
