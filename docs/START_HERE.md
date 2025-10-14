# 🎯 НАЧНИ ОТСЮДА - Деплой на VDS

## 📚 Файлы инструкций:

1. **`DEPLOY_FINAL.md`** - 📖 **ГЛАВНАЯ ИНСТРУКЦИЯ** (читай пошагово)
2. **`QUICK_FIX.md`** - 🚨 Быстрые решения проблем
3. **`DEPLOY_COMMANDS.sh`** - 🤖 Автоматический скрипт деплоя
4. **`nginx.conf.example`** - ⚙️ Конфигурация Nginx
5. **`ecosystem.config.js`** - 🔧 Конфигурация PM2

---

## 🚀 БЫСТРЫЙ СТАРТ (3 шага)

### 1️⃣ На своем Mac (в папке проекта):

```bash
cd /Users/ilagorelockin/Desktop/webapptraining

# Проверь, что все файлы на месте
ls -la DEPLOY_FINAL.md DEPLOY_COMMANDS.sh ecosystem.config.js

# Закоммить изменения в Git (если используешь)
git add .
git commit -m "Fix build errors and add deploy configs"
git push
```

---

### 2️⃣ На сервере VDS:

```bash
# Подключись к серверу
ssh root@твой_IP_адрес

# Перейди в папку проекта
cd ~/webapptraining

# Обнови код (если используешь Git)
git pull

# ИЛИ скопируй файлы с Mac через rsync (запусти на Mac в новом терминале):
# rsync -avz --exclude 'node_modules' --exclude '.next' \
#   /Users/ilagorelockin/Desktop/webapptraining/ \
#   root@твой_IP:/root/webapptraining/
```

---

### 3️⃣ Запусти автоматический скрипт:

```bash
# На сервере
cd ~/webapptraining
bash DEPLOY_COMMANDS.sh
```

**Скрипт автоматически:**
- Остановит PM2
- Очистит кэш
- Установит зависимости
- Соберет проект
- Запустит приложение
- Проверит статус

---

## ✅ Если скрипт выполнился успешно:

Открой в браузере: **https://training.nubofit.ru**

Должна загрузиться главная страница! 🎉

---

## ❌ Если скрипт выдал ошибку:

1. **Скопируй ВСЮ ошибку** (от начала до конца)
2. **Открой `DEPLOY_FINAL.md`** и найди раздел с этой ошибкой
3. **Следуй инструкциям** по исправлению
4. Или **отправь мне ошибку** - я помогу!

---

## 🔍 Быстрая диагностика (если что-то не работает):

```bash
# На сервере
cd ~/webapptraining

# Проверь статус
pm2 status

# Проверь логи
pm2 logs --lines 50

# Проверь порты
netstat -tulpn | grep -E ':(3000|3001)'

# Проверь Nginx
nginx -t
systemctl status nginx
```

---

## 📞 Нужна помощь?

**Скопируй и отправь мне результат:**

```bash
cd ~/webapptraining && \
echo "=== PM2 STATUS ===" && pm2 status && \
echo -e "\n=== PORTS ===" && netstat -tulpn | grep -E ':(3000|3001)' && \
echo -e "\n=== BUILD ID ===" && cat .next/BUILD_ID 2>&1 && \
echo -e "\n=== FRONTEND LOGS (last 30) ===" && pm2 logs nubo-training-frontend --lines 30 --nostream && \
echo -e "\n=== BACKEND LOGS (last 30) ===" && pm2 logs nubo-training-backend --lines 30 --nostream
```

---

## 🎓 Полезные команды (запомни):

```bash
# Перезапуск приложения
pm2 restart all

# Просмотр логов в реальном времени
pm2 logs

# Остановка приложения
pm2 stop all

# Запуск приложения
pm2 start ecosystem.config.js

# Статус
pm2 status

# Перезагрузка Nginx
nginx -t && systemctl reload nginx
```

---

## 📖 Порядок чтения документации:

1. **START_HERE.md** ← ты здесь 👈
2. **DEPLOY_FINAL.md** ← основная инструкция
3. **QUICK_FIX.md** ← если что-то сломалось
4. **DEPLOY_COMMANDS.sh** ← автоматизация

---

## ⚡ САМЫЙ БЫСТРЫЙ ПУТЬ:

**На сервере выполни одну команду:**

```bash
cd ~/webapptraining && bash DEPLOY_COMMANDS.sh
```

Если все ок - открывай **https://training.nubofit.ru** 🚀

Если ошибка - читай **DEPLOY_FINAL.md** 📖

---

## 🎯 Цель:

Сделать так, чтобы:
- ✅ PM2 показывал оба процесса `online`
- ✅ Порты 3000 и 3001 слушались
- ✅ Сайт открывался без ошибок 502
- ✅ Можно было зарегистрироваться и войти

**Удачи! Ты справишься! 💪**
