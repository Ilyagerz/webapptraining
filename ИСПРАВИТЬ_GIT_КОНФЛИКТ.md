# 🔧 Исправление Git конфликта на сервере

## Проблема:
```
error: Your local changes to the following files would be overwritten by merge:
	data/exercises-full.json
Please commit your changes or stash them before you merge.
```

---

## ✅ Решение (выполните на сервере):

```bash
cd ~/webapptraining

# 1. Сохраните локальные изменения в stash
git stash

# 2. Подтяните изменения
git pull origin main

# 3. Проверьте что custom-exercises.json появился
ls -lh data/custom-exercises.json
# Ожидается: ~116K

# 4. Проверьте количество упражнений
cat data/custom-exercises.json | grep '"id"' | wc -l
# Ожидается: 107

# 5. Очистите Next.js кэш
rm -rf .next

# 6. Пересоберите
npm run build

# 7. Перезапустите приложение
pm2 restart all

# 8. Проверьте логи
pm2 logs --lines 20

# 9. Проверьте API
curl http://localhost:3000/api/exercises/translated | head -100
```

---

## 📊 Что должно произойти:

### После git pull:
```bash
$ ls -lh data/
total 1.2M
-rw-r--r-- 1 root root 116K Oct 19 21:46 custom-exercises.json  # НОВЫЙ ФАЙЛ!
-rw-r--r-- 1 root root 1.1M Oct 17 12:43 exercises-full.json    # старый
```

### После npm run build:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (22/22)
```

### После проверки API:
```bash
$ curl http://localhost:3000/api/exercises/translated | python3 -m json.tool | grep '"id"' | wc -l
107  # ✅ Должно быть 107, а не 0!
```

---

## 🔍 Альтернативное решение (если нужно):

Если вы хотите полностью отменить локальные изменения:

```bash
# ВНИМАНИЕ: Это удалит все локальные изменения!
cd ~/webapptraining
git reset --hard origin/main
git pull origin main
rm -rf .next
npm run build
pm2 restart all
```

---

## ✅ Проверка после исправления:

```bash
# 1. Проверьте файлы
ls -lh data/*.json

# 2. Проверьте количество упражнений в custom-exercises.json
cat data/custom-exercises.json | grep '"id"' | wc -l

# 3. Проверьте API (должен вернуть JSON, не ошибку!)
curl http://localhost:3000/api/exercises/translated | python3 -m json.tool | head -50

# 4. Проверьте количество через API
curl http://localhost:3000/api/exercises/translated | python3 -m json.tool | grep '"id"' | wc -l
```

---

## 📝 Что изменилось:

### Было:
- ❌ Использовался `exercises-full.json` (1.1MB, из ExerciseDB API)
- ❌ Только 20 демо упражнений отображались

### Стало:
- ✅ Используется `custom-exercises.json` (116KB)
- ✅ 107 упражнений из вашего списка
- ✅ Локальные GIF файлы (967 штук)
- ✅ Работает offline

---

## 🚨 Если ошибка остается:

Пришлите вывод команд:

```bash
# 1. Текущий статус git
git status

# 2. Содержимое data/
ls -lh data/

# 3. Вывод API
curl http://localhost:3000/api/exercises/translated

# 4. Логи pm2
pm2 logs --lines 50 --err
```

---

## 💡 Почему это произошло:

Файл `data/exercises-full.json` был изменен на сервере (возможно, скриптом `npm run exercises:fetch-api`). Теперь мы используем новый файл `custom-exercises.json`, поэтому старые изменения можно безопасно отменить через `git stash` или `git reset`.

