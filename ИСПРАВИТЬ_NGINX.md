# 🔧 Исправление Nginx - API 404

## Проблема:
```
Cannot GET /api/exercises/translated
```

**Nginx не проксирует запросы к Next.js API!**

---

## ✅ Шаг 1: Проверьте локальный API

На сервере:

```bash
# Проверьте что Next.js API работает локально
curl http://localhost:3000/api/exercises/translated | head -100
```

### Если возвращает JSON:
✅ Next.js работает правильно  
❌ Проблема в nginx конфигурации

### Если возвращает ошибку:
❌ Проблема в Next.js  
→ Перезапустите: `pm2 restart all`

---

## ✅ Шаг 2: Проверьте Nginx конфигурацию

```bash
# Найдите конфиг для вашего домена
sudo cat /etc/nginx/sites-available/training.nubofit.ru

# ИЛИ
sudo cat /etc/nginx/sites-enabled/training.nubofit.ru

# ИЛИ все конфиги
sudo ls -la /etc/nginx/sites-enabled/
```

---

## ✅ Шаг 3: Исправьте Nginx конфигурацию

### Правильная конфигурация должна быть:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name training.nubofit.ru;

    # Редирект на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name training.nubofit.ru;

    # SSL сертификаты
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # ВАЖНО: Proxy для API
    location /api/ {
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

    # ВАЖНО: Proxy для _next (статика Next.js)
    location /_next/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Остальные запросы
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
}
```

---

## ✅ Шаг 4: Примените изменения

```bash
# 1. Отредактируйте конфиг
sudo nano /etc/nginx/sites-available/training.nubofit.ru

# 2. Проверьте синтаксис
sudo nginx -t

# 3. Если OK - перезагрузите nginx
sudo systemctl reload nginx

# ИЛИ
sudo service nginx reload

# 4. Проверьте статус
sudo systemctl status nginx
```

---

## ✅ Шаг 5: Проверьте что работает

```bash
# Тест 1: Локально
curl http://localhost:3000/api/exercises/translated | head -50

# Тест 2: Через публичный URL
curl https://training.nubofit.ru/api/exercises/translated | head -50

# Тест 3: Количество упражнений
curl https://training.nubofit.ru/api/exercises/translated 2>/dev/null | grep -o '"id"' | wc -l
# Должно быть: 107
```

---

## 🔍 Альтернатива: Если конфига НЕТ

### Создайте новый конфиг:

```bash
# 1. Создайте файл
sudo nano /etc/nginx/sites-available/training.nubofit.ru

# 2. Вставьте конфигурацию (см. выше)

# 3. Создайте симлинк
sudo ln -s /etc/nginx/sites-available/training.nubofit.ru /etc/nginx/sites-enabled/

# 4. Проверьте и перезагрузите
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🚨 Типичные ошибки в конфигурации:

### Ошибка 1: Нет proxy для /api/

```nginx
# ❌ НЕПРАВИЛЬНО
location / {
    root /var/www/html;
}

# ✅ ПРАВИЛЬНО
location /api/ {
    proxy_pass http://localhost:3000;
}
```

### Ошибка 2: Неправильный proxy_pass

```nginx
# ❌ НЕПРАВИЛЬНО
location /api/ {
    proxy_pass http://localhost:3000/;  # Лишний слэш!
}

# ✅ ПРАВИЛЬНО
location /api/ {
    proxy_pass http://localhost:3000;  # Без слэша
}
```

### Ошибка 3: Порт не тот

```nginx
# Убедитесь что Next.js запущен на правильном порту
# Проверьте:
pm2 logs nubo-training | grep "Ready"
# Должно быть: "Ready on http://localhost:3000"
```

---

## 📊 Проверка после исправления:

### В терминале:

```bash
# 1. Локальный API работает
curl http://localhost:3000/api/exercises/translated | python3 -m json.tool | head -20

# 2. Публичный API работает (не 404!)
curl https://training.nubofit.ru/api/exercises/translated | python3 -m json.tool | head -20

# 3. Nginx статус OK
sudo systemctl status nginx
```

### В браузере:

1. Откройте https://training.nubofit.ru
2. DevTools → Network
3. Найдите запрос `/api/exercises/translated`
4. Должен быть: **200 OK** (не 404!)

---

## 💡 Если используете другой proxy (не nginx):

### Apache:

```apache
ProxyPass /api/ http://localhost:3000/api/
ProxyPassReverse /api/ http://localhost:3000/api/
```

### Caddy:

```caddy
training.nubofit.ru {
    reverse_proxy /api/* localhost:3000
    reverse_proxy /* localhost:3000
}
```

### Traefik:

```yaml
http:
  routers:
    nubo:
      rule: "Host(`training.nubofit.ru`)"
      service: nubo-service
  services:
    nubo-service:
      loadBalancer:
        servers:
          - url: "http://localhost:3000"
```

---

## 🚨 Если ничего не помогает:

### Временное решение - без proxy:

```bash
# Остановите nginx
sudo systemctl stop nginx

# Запустите Next.js на порту 80 (нужен root)
pm2 delete all
sudo PORT=80 pm2 start npm --name "nubo" -- start
pm2 save

# Проверьте
curl http://training.nubofit.ru/api/exercises/translated | head -50
```

**⚠️ Это НЕ рекомендуется для production!**

---

## 📞 Отправьте результаты:

```bash
# 1. Nginx конфиг
sudo cat /etc/nginx/sites-available/training.nubofit.ru

# 2. Nginx статус
sudo systemctl status nginx

# 3. Локальный тест
curl http://localhost:3000/api/exercises/translated | head -50

# 4. Публичный тест
curl https://training.nubofit.ru/api/exercises/translated | head -50

# 5. PM2 процессы
pm2 list
pm2 logs nubo-training --lines 20 --nostream
```

