# 🚨 БЫСТРОЕ ИСПРАВЛЕНИЕ (если что-то сломалось)

## 1️⃣ Полная перезагрузка приложения

```bash
cd ~/webapptraining
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

---

## 2️⃣ Если PM2 показывает `errored` или постоянно перезапускается

```bash
# Останови все
pm2 delete all

# Запусти фронтенд вручную для диагностики
cd ~/webapptraining
NODE_ENV=production npm start
```

Смотри, какая ошибка. Нажми `Ctrl+C` чтобы остановить.

**Частые ошибки:**

### Ошибка: "Could not find a production build"
```bash
rm -rf .next
NODE_ENV=production npm run build
pm2 start ecosystem.config.js
```

### Ошибка: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
NODE_ENV=production npm run build
pm2 start ecosystem.config.js
```

### Ошибка: "Port 3000 already in use"
```bash
# Найди процесс на порту 3000
lsof -i :3000
# Убей процесс (замени PID на номер из предыдущей команды)
kill -9 PID
# Или убей все node процессы
pkill -9 node
# Запусти заново
pm2 start ecosystem.config.js
```

---

## 3️⃣ Если 502 Bad Gateway

```bash
# Проверь статус
pm2 status

# Оба должны быть online!
# Если нет - смотри логи:
pm2 logs nubo-training-frontend --lines 100
pm2 logs nubo-training-backend --lines 100

# Проверь порты
netstat -tulpn | grep -E ':(3000|3001)'

# Должно быть:
# tcp  0.0.0.0:3000  LISTEN  node
# tcp  0.0.0.0:3001  LISTEN  node

# Если портов нет - приложение не запустилось!
# Перезапусти:
pm2 restart all

# Проверь Nginx
systemctl status nginx
nginx -t
systemctl reload nginx
```

---

## 4️⃣ Обновление кода после изменений

```bash
cd ~/webapptraining

# Останови приложения
pm2 stop all

# Обнови код (если используешь Git)
git pull

# Или скопируй файлы с Mac через rsync
# (запусти на Mac):
# rsync -avz --exclude 'node_modules' --exclude '.next' \
#   /Users/ilagorelockin/Desktop/webapptraining/ \
#   root@твой_IP:/root/webapptraining/

# Пересобери
rm -rf .next
NODE_ENV=production npm run build

# Запусти
pm2 restart all
pm2 save
```

---

## 5️⃣ Просмотр логов в реальном времени

```bash
# Все логи
pm2 logs

# Только фронтенд
pm2 logs nubo-training-frontend

# Только бэкенд
pm2 logs nubo-training-backend

# Nginx ошибки
tail -f /var/log/nginx/nubotraining-error.log

# Выход из логов: Ctrl+C
```

---

## 6️⃣ Проверка здоровья системы

```bash
# Статус PM2
pm2 status

# Использование ресурсов
pm2 monit

# Порты
netstat -tulpn | grep -E ':(3000|3001|80|443)'

# Nginx
systemctl status nginx

# Свободное место на диске
df -h

# Использование памяти
free -h
```

---

## 7️⃣ Если нужно полностью переустановить

```bash
cd ~/webapptraining

# Останови все
pm2 delete all

# Полная очистка
rm -rf node_modules .next package-lock.json
npm cache clean --force

# Установка
npm install --production=false

# Сборка
NODE_ENV=production npm run build

# Проверь, что билд создался
ls -la .next/BUILD_ID
cat .next/BUILD_ID

# Запуск
pm2 start ecosystem.config.js
pm2 save

# Статус
pm2 status

# Логи
pm2 logs --lines 50
```

---

## 8️⃣ Обновление SSL сертификата

```bash
# Продление сертификата
certbot renew

# Или принудительное обновление
certbot renew --force-renewal

# Перезагрузка Nginx
systemctl reload nginx
```

---

## 9️⃣ Если Nginx не запускается

```bash
# Проверь конфигурацию
nginx -t

# Если ошибка - смотри подробности
cat /etc/nginx/sites-available/training.nubofit.ru

# Проверь, что симлинк создан
ls -la /etc/nginx/sites-enabled/ | grep training

# Если нет - создай
ln -sf /etc/nginx/sites-available/training.nubofit.ru /etc/nginx/sites-enabled/

# Перезапусти
systemctl restart nginx
```

---

## 🆘 Если ничего не помогает

**Собери всю информацию и отправь мне:**

```bash
echo "=== PM2 STATUS ===" && \
pm2 status && \
echo "" && \
echo "=== FRONTEND LOGS ===" && \
pm2 logs nubo-training-frontend --lines 50 --nostream && \
echo "" && \
echo "=== BACKEND LOGS ===" && \
pm2 logs nubo-training-backend --lines 50 --nostream && \
echo "" && \
echo "=== PORTS ===" && \
netstat -tulpn | grep -E ':(3000|3001)' && \
echo "" && \
echo "=== BUILD ID ===" && \
cat ~/webapptraining/.next/BUILD_ID 2>&1 && \
echo "" && \
echo "=== NGINX STATUS ===" && \
systemctl status nginx && \
echo "" && \
echo "=== NGINX ERRORS ===" && \
tail -50 /var/log/nginx/nubotraining-error.log
```

Скопируй весь вывод и отправь!

---

## ✅ Команды для копирования (одной строкой)

### Быстрый рестарт
```bash
cd ~/webapptraining && pm2 restart all && pm2 status
```

### Полная перезагрузка
```bash
cd ~/webapptraining && pm2 delete all && pm2 start ecosystem.config.js && pm2 save && pm2 status
```

### Пересборка и рестарт
```bash
cd ~/webapptraining && pm2 stop all && rm -rf .next && NODE_ENV=production npm run build && pm2 restart all && pm2 status
```

### Просмотр логов
```bash
pm2 logs --lines 100
```

### Диагностика
```bash
pm2 status && echo "---" && netstat -tulpn | grep -E ':(3000|3001)' && echo "---" && systemctl status nginx
```

