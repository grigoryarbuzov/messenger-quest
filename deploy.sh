#!/bin/bash

# Скрипт деплоя для Beget
# Запускать на сервере после клонирования репозитория

set -e

echo "🚀 Начало деплоя Quest Messenger..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка Node.js
echo -e "${YELLOW}Проверка Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js не установлен!${NC}"
    echo "Обратитесь в поддержку Beget для активации Node.js"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js версия: $NODE_VERSION${NC}"

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm не установлен!${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓ npm версия: $NPM_VERSION${NC}"

# Установка зависимостей
echo -e "${YELLOW}Установка зависимостей...${NC}"
npm install

# Проверка .env.local
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  Файл .env.local не найден!${NC}"
    echo "Создайте файл .env.local с необходимыми переменными:"
    echo ""
    cat .env.example
    echo ""
    read -p "Создать .env.local сейчас? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Введите OPENROUTER_API_KEY: " api_key
        read -p "Введите URL сайта (например, https://your-domain.ru): " app_url

        cat > .env.local << EOF
OPENROUTER_API_KEY=$api_key
DATABASE_URL=file:./game.db
NEXT_PUBLIC_APP_URL=$app_url
EOF
        echo -e "${GREEN}✓ Файл .env.local создан${NC}"
    else
        echo -e "${RED}❌ Создайте .env.local вручную перед продолжением${NC}"
        exit 1
    fi
fi

# Инициализация базы данных
echo -e "${YELLOW}Инициализация базы данных...${NC}"
npm run db:init
echo -e "${GREEN}✓ База данных инициализирована${NC}"

# Сборка приложения
echo -e "${YELLOW}Сборка приложения...${NC}"
npm run build
echo -e "${GREEN}✓ Приложение собрано${NC}"

# Проверка PM2
echo -e "${YELLOW}Настройка PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo "PM2 не установлен. Установить сейчас? (y/n)"
    read -p "" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g pm2
        echo -e "${GREEN}✓ PM2 установлен${NC}"
    else
        echo -e "${YELLOW}⚠️  PM2 не установлен. Используйте 'npm start' для запуска${NC}"
        echo ""
        echo "Для запуска приложения выполните:"
        echo "  npm start"
        exit 0
    fi
fi

# Запуск через PM2
echo -e "${YELLOW}Запуск приложения через PM2...${NC}"
pm2 stop messenger-quest 2>/dev/null || true
pm2 delete messenger-quest 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo ""
echo -e "${GREEN}✅ Деплой завершен успешно!${NC}"
echo ""
echo "📊 Статус приложения:"
pm2 status

echo ""
echo "Полезные команды:"
echo "  pm2 logs messenger-quest  - просмотр логов"
echo "  pm2 restart messenger-quest  - перезапуск"
echo "  pm2 stop messenger-quest  - остановка"
echo ""
echo "🌐 Не забудьте настроить проксирование в панели Beget:"
echo "  Порт: 3000"
echo "  Путь: $(pwd)"
