# 📚 ПОЛНОЕ РУКОВОДСТВО ПО GIT

## 🎯 Что такое Git?

Git - это система контроля версий, которая позволяет:
- ✅ Сохранять историю изменений кода
- ✅ Откатываться к предыдущим версиям
- ✅ Работать над проектом с командой
- ✅ Создавать резервные копии

---

## 🚀 БЫСТРЫЙ СТАРТ (5 минут)

### 1. Инициализация Git в проекте

```bash
cd /Users/ilagorelockin/Desktop/webapptraining

# Инициализируй Git
git init

# Настрой свои данные (один раз)
git config --global user.name "Твое Имя"
git config --global user.email "твой@email.com"
```

### 2. Первый коммит (сохранение)

```bash
# Добавь все файлы
git add .

# Сохрани изменения с описанием
git commit -m "Initial commit: восстановлены все файлы"
```

### 3. Создай репозиторий на GitHub

1. Зайди на https://github.com
2. Нажми "New repository"
3. Назови его `webapptraining`
4. НЕ добавляй README, .gitignore, license
5. Нажми "Create repository"

### 4. Подключи к GitHub

```bash
# Подключи удаленный репозиторий (замени USERNAME на свой)
git remote add origin https://github.com/USERNAME/webapptraining.git

# Отправь код на GitHub
git branch -M main
git push -u origin main
```

✅ **ГОТОВО!** Теперь твой код на GitHub!

---

## 📖 ОСНОВНЫЕ КОМАНДЫ

### Проверка статуса

```bash
# Посмотри, какие файлы изменены
git status
```

### Сохранение изменений

```bash
# Добавь все измененные файлы
git add .

# Или добавь конкретный файл
git add app/dashboard/page.tsx

# Сохрани с описанием
git commit -m "Описание того, что изменил"
```

### Отправка на GitHub

```bash
# Отправь изменения
git push
```

### Получение изменений

```bash
# Получи последние изменения с GitHub
git pull
```

---

## 💡 ТИПИЧНЫЕ СЦЕНАРИИ

### Сценарий 1: Ежедневная работа

```bash
# Утром - получи последние изменения
git pull

# Работай над кодом...

# Вечером - сохрани изменения
git add .
git commit -m "Добавил новую фичу X"
git push
```

### Сценарий 2: Исправил баг

```bash
git add .
git commit -m "Fix: исправлена ошибка с пустыми файлами"
git push
```

### Сценарий 3: Добавил новую фичу

```bash
git add .
git commit -m "Feature: добавлен калькулятор блинов"
git push
```

### Сценарий 4: Откат изменений

```bash
# Посмотри историю коммитов
git log --oneline

# Откатись к предыдущему коммиту
git reset --hard HEAD~1

# Или к конкретному коммиту
git reset --hard abc123
```

---

## 🌿 РАБОТА С ВЕТКАМИ

### Зачем нужны ветки?

Ветки позволяют работать над новыми фичами, не ломая основной код.

### Создание ветки

```bash
# Создай новую ветку для фичи
git checkout -b feature/new-dashboard

# Работай в этой ветке
git add .
git commit -m "Работаю над новым дашбордом"
git push -u origin feature/new-dashboard
```

### Слияние веток

```bash
# Вернись в main
git checkout main

# Слей изменения из ветки
git merge feature/new-dashboard

# Отправь на GitHub
git push
```

### Удаление ветки

```bash
# Удали локально
git branch -d feature/new-dashboard

# Удали на GitHub
git push origin --delete feature/new-dashboard
```

---

## 🔥 ПОЛЕЗНЫЕ КОМАНДЫ

### Просмотр истории

```bash
# Красивая история коммитов
git log --oneline --graph --all

# Последние 10 коммитов
git log --oneline -10

# Изменения в конкретном файле
git log -- app/dashboard/page.tsx
```

### Отмена изменений

```bash
# Отмени изменения в файле (до git add)
git checkout -- app/dashboard/page.tsx

# Отмени git add (но сохрани изменения)
git reset app/dashboard/page.tsx

# Отмени последний коммит (но сохрани изменения)
git reset --soft HEAD~1

# Полностью удали последний коммит
git reset --hard HEAD~1
```

### Игнорирование файлов

Создай файл `.gitignore`:

```bash
# Создай .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build
.next/
out/
build/
dist/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Misc
*.log
.cache/
EOF

# Добавь в Git
git add .gitignore
git commit -m "Add .gitignore"
```

---

## 🆘 РЕШЕНИЕ ПРОБЛЕМ

### Проблема: Конфликт при git pull

```bash
# Если есть конфликты
git status  # Посмотри конфликтующие файлы

# Открой файлы и исправь конфликты (удали маркеры <<<< ==== >>>>)

# После исправления
git add .
git commit -m "Resolve merge conflicts"
git push
```

### Проблема: Случайно закоммитил лишнее

```bash
# Отмени последний коммит
git reset --soft HEAD~1

# Убери лишние файлы из staging
git reset путь/к/файлу

# Закоммить заново
git add нужные_файлы
git commit -m "Правильный коммит"
```

### Проблема: Нужно изменить последний коммит

```bash
# Внеси изменения в файлы

# Добавь к последнему коммиту
git add .
git commit --amend --no-edit

# Или измени сообщение
git commit --amend -m "Новое сообщение"

# Отправь (force push)
git push --force
```

---

## 📝 ПРАВИЛА ХОРОШИХ КОММИТОВ

### Формат сообщения

```
Тип: Краткое описание (до 50 символов)

Подробное описание (если нужно)
```

### Типы коммитов

- `feat:` - новая фича
- `fix:` - исправление бага
- `docs:` - изменения в документации
- `style:` - форматирование, отступы
- `refactor:` - рефакторинг кода
- `test:` - добавление тестов
- `chore:` - обновление зависимостей, конфигов

### Примеры хороших коммитов

```bash
git commit -m "feat: добавлен калькулятор блинов"
git commit -m "fix: исправлена ошибка с пустыми файлами"
git commit -m "docs: обновлена документация по Git"
git commit -m "refactor: упрощена логика дашборда"
git commit -m "chore: обновлены зависимости"
```

---

## 🎓 ШПАРГАЛКА

```bash
# Инициализация
git init                          # Создать репозиторий
git clone URL                     # Клонировать репозиторий

# Основные команды
git status                        # Статус
git add .                         # Добавить все файлы
git commit -m "message"           # Сохранить изменения
git push                          # Отправить на GitHub
git pull                          # Получить с GitHub

# Ветки
git branch                        # Список веток
git checkout -b name              # Создать ветку
git checkout name                 # Переключиться на ветку
git merge name                    # Слить ветку

# История
git log                           # История коммитов
git log --oneline                 # Краткая история
git diff                          # Изменения

# Отмена
git reset --soft HEAD~1           # Отменить коммит
git reset --hard HEAD~1           # Удалить коммит
git checkout -- file              # Отменить изменения в файле

# Удаленный репозиторий
git remote add origin URL         # Добавить remote
git remote -v                     # Список remotes
git push -u origin main           # Первый push
```

---

## 🚀 ДЕПЛОЙ С GIT

### На сервер через Git

```bash
# На сервере
cd ~/webapptraining
git pull
npm install
npm run build
pm2 restart all
```

### Автоматизация (создай скрипт)

```bash
# Создай deploy.sh
cat > deploy.sh << 'EOF'
#!/bin/bash
git pull
npm install
npm run build
pm2 restart all
echo "✅ Деплой завершен!"
EOF

chmod +x deploy.sh

# Теперь просто запускай
./deploy.sh
```

---

## 💡 СОВЕТЫ

1. **Коммить часто** - лучше много маленьких коммитов, чем один большой
2. **Писать понятные сообщения** - через месяц ты забудешь, что делал
3. **Не коммитить секреты** - никогда не добавляй `.env` с паролями
4. **Использовать ветки** - для каждой фичи своя ветка
5. **Делать pull перед push** - чтобы избежать конфликтов

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- [Git Book (русский)](https://git-scm.com/book/ru/v2)
- [GitHub Docs](https://docs.github.com)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Visualizing Git](https://git-school.github.io/visualizing-git/)

---

## ✅ ЧЕКЛИСТ ДЛЯ НАЧАЛА

- [ ] Установил Git
- [ ] Настроил user.name и user.email
- [ ] Инициализировал репозиторий (`git init`)
- [ ] Создал `.gitignore`
- [ ] Сделал первый коммит
- [ ] Создал репозиторий на GitHub
- [ ] Подключил remote (`git remote add origin`)
- [ ] Отправил код (`git push`)

**Теперь ты готов работать с Git! 🎉**

