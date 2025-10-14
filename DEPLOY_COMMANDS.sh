#!/bin/bash
# 🚀 Скрипт для быстрого деплоя на VDS
# Запускай на сервере: bash DEPLOY_COMMANDS.sh

set -e  # Останавливаться при ошибках

echo "🛑 Шаг 1: Останавливаем PM2..."
pm2 delete all || true

echo "🧹 Шаг 2: Очистка..."
rm -rf node_modules .next package-lock.json
npm cache clean --force

echo "📦 Шаг 3: Установка зависимостей..."
npm install --production=false

echo "🔨 Шаг 4: Сборка проекта..."
NODE_ENV=production npm run build

echo "✅ Шаг 5: Проверка билда..."
if [ ! -f .next/BUILD_ID ]; then
    echo "❌ ОШИБКА: Билд не создался! Проверь ошибки выше."
    exit 1
fi
echo "BUILD_ID найден: $(cat .next/BUILD_ID)"

echo "🚀 Шаг 6: Запуск PM2..."
pm2 start ecosystem.config.js
pm2 save

echo "📊 Шаг 7: Статус PM2..."
pm2 status

echo "🔍 Шаг 8: Проверка портов..."
sleep 3
netstat -tulpn | grep -E ':(3000|3001)' || echo "⚠️  Порты не слушаются!"

echo "🌐 Шаг 9: Перезагрузка Nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "✅ ДЕПЛОЙ ЗАВЕРШЕН!"
echo ""
echo "📝 Проверь логи:"
echo "   pm2 logs nubo-training-frontend --lines 50"
echo "   pm2 logs nubo-training-backend --lines 50"
echo ""
echo "🌍 Открой в браузере: https://training.nubofit.ru"
echo ""

