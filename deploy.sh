#!/bin/bash

# 🚀 Скрипт для швидкого розгортання на Vercel
# © 2026 Ілля Чернов (SmileAfterBurn)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🇺🇦 РОЗГОРТАННЯ ІНКЛЮЗИВНОЇ МАПИ СОЦІАЛЬНИХ ПОСЛУГ УКРАЇНИ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Перевірка готовності...${NC}"
echo ""

# Перевірка необхідних файлів
FILES=("vercel.json" "package.json" "DEPLOYMENT.md" ".env.example")
ALL_OK=true

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ✅ $file"
    else
        echo -e "  ${RED}❌ $file - ВІДСУТНІЙ${NC}"
        ALL_OK=false
    fi
done

echo ""

if [ "$ALL_OK" = false ]; then
    echo -e "${RED}❌ Не всі необхідні файли присутні!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Всі файли на місці!${NC}"
echo ""

# Перевірка чи встановлені залежності
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules не знайдено. Встановлюємо залежності...${NC}"
    npm install
    echo ""
fi

# Перевірка білда
echo -e "${BLUE}🔨 Тестуємо збірку проекту...${NC}"
npm run build > /tmp/build.log 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Білд успішний!${NC}"
    BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    echo -e "   Розмір білду: ${BUILD_SIZE}"
else
    echo -e "${RED}❌ Помилка білду! Перевірте /tmp/build.log${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ РЕПОЗИТОРІЙ ГОТОВИЙ ДО РОЗГОРТАННЯ!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}🚀 ОБЕРІТЬ СПОСІБ РОЗГОРТАННЯ:${NC}"
echo ""
echo "1️⃣  Швидке розгортання (рекомендовано)"
echo "    👉 Відкрийте в браузері:"
echo -e "    ${GREEN}https://vercel.com/new/clone?repository-url=https://github.com/SmileAfterBurn/Social${NC}"
echo ""

echo "2️⃣  Через Vercel Dashboard"
echo "    👉 Крок 1: https://vercel.com/new"
echo "    👉 Крок 2: Оберіть SmileAfterBurn/Social"
echo "    👉 Крок 3: Додайте Environment Variables (див. .env.example)"
echo ""

echo "3️⃣  Через Vercel CLI (для досвідчених)"
echo "    Виконайте команди:"
echo -e "    ${YELLOW}npm install -g vercel${NC}"
echo -e "    ${YELLOW}vercel login${NC}"
echo -e "    ${YELLOW}vercel --prod${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}⚠️  НЕ ЗАБУДЬТЕ ДОДАТИ ENVIRONMENT VARIABLES:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Обов'язкові:"
echo "  • VITE_GOOGLE_MAPS_API_KEY"
echo "  • VITE_GEMINI_API_KEY"
echo ""
echo "Опціонально (Firebase):"
echo "  • VITE_FIREBASE_API_KEY"
echo "  • VITE_FIREBASE_AUTH_DOMAIN"
echo "  • та інші (див. .env.example)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📚 ДОКУМЕНТАЦІЯ:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  📄 РОЗГОРТАННЯ.md - Детальна інструкція українською"
echo "  📄 DEPLOYMENT.md - Detailed guide in English"
echo "  📄 VERCEL_DEPLOYMENT_SUMMARY.md - Technical summary"
echo "  📄 .env.example - Environment variables template"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 ГОТОВО ДО ЗАПУСКУ!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🇺🇦 Слава Україні! 🇺🇦"
echo ""
