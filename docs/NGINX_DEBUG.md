# 🔧 Отладка Nginx

## 1. Проверь статус и логи:

```bash
# Посмотри статус
systemctl status nginx.service

# Посмотри логи
journalctl -xeu nginx.service

# Проверь конфиг с подробностями
nginx -t -v
```

## 2. Проверь конфиг:

```bash
# Открой конфиг
nano /etc/nginx/sites-available/training.nubofit.ru

# Должно быть точно так:
server {
    listen 80;
    listen [::]:80;
    server_name training.nubofit.ru;

    access_log /var/log/nginx/nubotraining-access.log;
    error_log /var/log/nginx/nubotraining-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 3. Проверь права:

```bash
# Проверь права на конфиг
ls -la /etc/nginx/sites-available/training.nubofit.ru

# Проверь права на логи
ls -la /var/log/nginx/

# Создай лог файлы если их нет
touch /var/log/nginx/nubotraining-access.log
touch /var/log/nginx/nubotraining-error.log

# Установи правильные права
chown www-data:www-data /var/log/nginx/nubotraining-*.log
chmod 644 /var/log/nginx/nubotraining-*.log
```

## 4. Проверь синтаксис:

```bash
# Проверь основной конфиг
cat /etc/nginx/nginx.conf

# Проверь что нет конфликтов
ls -la /etc/nginx/sites-enabled/

# Удали дефолтный конфиг если есть
rm /etc/nginx/sites-enabled/default
```

## 5. Перезапусти с чистого листа:

```bash
# Останови Nginx
systemctl stop nginx

# Проверь что процессы остановлены
ps aux | grep nginx

# Запусти заново
systemctl start nginx

# Проверь статус
systemctl status nginx
```

## 6. Проверь порты:

```bash
# Проверь что порты 80/443 свободны
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Проверь что Next.js и Express работают
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
```

## 7. Минимальный тестовый конфиг:

Если все еще есть проблемы, попробуй минимальный конфиг:

```nginx
server {
    listen 80;
    server_name training.nubofit.ru;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

## 8. Проверь SELinux:

```bash
# Проверь статус SELinux
sestatus

# Если включен, разреши Nginx работать как прокси
setsebool -P httpd_can_network_connect 1
```

## 9. Общие решения:

1. **Проверь синтаксис:**
   - Нет ли лишних или пропущенных скобок `{}`
   - Все директивы заканчиваются `;`
   - Нет лишних пробелов в конце строк

2. **Проверь файлы:**
   - Конфиг в UTF-8 без BOM
   - Нет скрытых символов
   - Правильные права доступа

3. **Проверь процессы:**
   - Нет ли зависших процессов Nginx
   - Все порты свободны
   - Next.js и Express работают

## 10. Отправь мне:

1. Вывод `nginx -t`
2. Вывод `systemctl status nginx.service`
3. Содержимое твоего конфига

И я помогу найти проблему! 💪
