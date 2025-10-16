// Backend API для NUBO Training
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3001;

// Проверка что JWT_SECRET загружен
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET не найден в .env.local');
  console.error('Пожалуйста, проверьте файл .env.local');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// In-memory хранилище (в продакшене использовать MongoDB)
const users = new Map();
const workouts = new Map();
const templates = new Map();
const measurements = new Map();
const exercises = new Map();

// Загрузка упражнений из JSON
const fs = require('fs');
const path = require('path');

try {
  const exercisesPath = path.join(__dirname, '..', 'data', 'exercises.json');
  const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));
  exercisesData.forEach(ex => exercises.set(ex.id, ex));
  console.log(`✅ Загружено ${exercises.size} упражнений`);
} catch (error) {
  console.log('⚠️  Не удалось загрузить упражнения:', error.message);
}

// Валидация Telegram initData
function validateTelegramData(initData) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) return false;
    
    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.TELEGRAM_BOT_TOKEN)
      .digest();
    
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Telegram validation error:', error);
    return false;
  }
}

// Middleware для проверки JWT
function authenticateToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Недействительный токен' });
  }
}

// Auth Routes
app.post('/api/auth/telegram', (req, res) => {
  const { initData } = req.body;
  
  // Валидация Telegram initData
  const isValid = validateTelegramData(initData);
  if (!isValid) {
    console.error('Invalid Telegram initData');
    return res.status(401).json({ error: 'Недействительные данные Telegram' });
  }
  
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (!userParam) {
      return res.status(400).json({ error: 'Данные пользователя не найдены' });
    }
    
    const telegramUser = JSON.parse(decodeURIComponent(userParam));
    const userId = `tg-${telegramUser.id}`;
    
    // Создаем или обновляем пользователя
    let user = users.get(userId);
    
    if (!user) {
      user = {
        id: userId,
        telegramId: telegramUser.id,
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        photoUrl: telegramUser.photo_url,
        createdAt: new Date(),
        settings: {
          theme: 'light',
          restTimerDefault: 90,
          soundEnabled: true,
          vibrationEnabled: true,
          autoStartTimer: true,
          weightUnit: 'kg',
        },
      };
      users.set(userId, user);
    } else {
      // Обновляем информацию
      user.username = telegramUser.username;
      user.firstName = telegramUser.first_name;
      user.lastName = telegramUser.last_name;
      user.photoUrl = telegramUser.photo_url;
    }
    
    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Устанавливаем cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });
    
    res.json({ user, token });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
});

// Email/Password auth
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }
  
  // Проверяем существует ли пользователь
  const existingUser = Array.from(users.values()).find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email уже используется' });
  }
  
  try {
    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userId = `user-${Date.now()}`;
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      firstName: name,
      createdAt: new Date(),
      settings: {
        theme: 'light',
        restTimerDefault: 90,
        soundEnabled: true,
        vibrationEnabled: true,
        autoStartTimer: true,
        weightUnit: 'kg',
      },
    };
    
    users.set(userId, user);
    
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    
    // Не отправляем пароль в ответе
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }
  
  const user = Array.from(users.values()).find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }
  
  try {
    // Проверяем пароль с bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.get(req.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// User Settings
app.put('/api/user/settings', authenticateToken, (req, res) => {
  const user = users.get(req.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  
  user.settings = { ...user.settings, ...req.body };
  users.set(req.userId, user);
  
  res.json({ settings: user.settings });
});

// Workouts
app.get('/api/workouts', authenticateToken, (req, res) => {
  const userWorkouts = Array.from(workouts.values())
    .filter(w => w.userId === req.userId)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  
  res.json({ workouts: userWorkouts });
});

app.get('/api/workouts/:id', authenticateToken, (req, res) => {
  const workout = workouts.get(req.params.id);
  
  if (!workout || workout.userId !== req.userId) {
    return res.status(404).json({ error: 'Тренировка не найдена' });
  }
  
  res.json({ workout });
});

app.post('/api/workouts', authenticateToken, (req, res) => {
  const workout = {
    ...req.body,
    userId: req.userId,
    id: req.body.id || `workout-${Date.now()}`,
  };
  
  workouts.set(workout.id, workout);
  res.json({ workout });
});

app.put('/api/workouts/:id', authenticateToken, (req, res) => {
  const workout = workouts.get(req.params.id);
  
  if (!workout || workout.userId !== req.userId) {
    return res.status(404).json({ error: 'Тренировка не найдена' });
  }
  
  const updated = { ...workout, ...req.body };
  workouts.set(req.params.id, updated);
  
  res.json({ workout: updated });
});

app.delete('/api/workouts/:id', authenticateToken, (req, res) => {
  const workout = workouts.get(req.params.id);
  
  if (!workout || workout.userId !== req.userId) {
    return res.status(404).json({ error: 'Тренировка не найдена' });
  }
  
  workouts.delete(req.params.id);
  res.json({ success: true });
});

// Templates
app.get('/api/templates', authenticateToken, (req, res) => {
  const userTemplates = Array.from(templates.values())
    .filter(t => t.userId === req.userId || t.isSystemTemplate);
  
  res.json({ templates: userTemplates });
});

app.post('/api/templates', authenticateToken, (req, res) => {
  const template = {
    ...req.body,
    userId: req.userId,
    id: req.body.id || `template-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    isSystemTemplate: false,
  };
  
  templates.set(template.id, template);
  res.json({ template });
});

app.put('/api/templates/:id', authenticateToken, (req, res) => {
  const template = templates.get(req.params.id);
  
  if (!template || (template.userId !== req.userId && !template.isSystemTemplate)) {
    return res.status(404).json({ error: 'Шаблон не найден' });
  }
  
  const updated = { ...template, ...req.body, updatedAt: new Date() };
  templates.set(req.params.id, updated);
  
  res.json({ template: updated });
});

app.delete('/api/templates/:id', authenticateToken, (req, res) => {
  const template = templates.get(req.params.id);
  
  if (!template || template.userId !== req.userId) {
    return res.status(404).json({ error: 'Шаблон не найден' });
  }
  
  templates.delete(req.params.id);
  res.json({ success: true });
});

// Measurements
app.get('/api/measurements', authenticateToken, (req, res) => {
  const userMeasurements = Array.from(measurements.values())
    .filter(m => m.userId === req.userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json({ measurements: userMeasurements });
});

app.post('/api/measurements', authenticateToken, (req, res) => {
  const measurement = {
    ...req.body,
    userId: req.userId,
    id: req.body.id || `measurement-${Date.now()}`,
  };
  
  measurements.set(measurement.id, measurement);
  res.json({ measurement });
});

// Statistics
app.get('/api/stats', authenticateToken, (req, res) => {
  const userWorkouts = Array.from(workouts.values())
    .filter(w => w.userId === req.userId && w.completedAt);
  
  const totalWorkouts = userWorkouts.length;
  const totalVolume = userWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
  const totalDuration = userWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  
  // Вычисляем streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const sortedWorkouts = userWorkouts.sort((a, b) => 
    new Date(b.completedAt) - new Date(a.completedAt)
  );
  
  // TODO: Реализовать правильный подсчет streak
  
  res.json({
    stats: {
      userId: req.userId,
      totalWorkouts,
      totalVolume,
      totalDuration,
      currentStreak,
      longestStreak,
      favoriteExercises: [],
      volumeByMuscleGroup: {},
      weeklyWorkouts: [],
    },
  });
});

// ==================== WORKOUT ENDPOINTS ====================

// Создать тренировку
app.post('/api/workouts', authenticateToken, (req, res) => {
  const workout = {
    ...req.body,
    id: req.body.id || `workout-${Date.now()}`,
    userId: req.userId,
    createdAt: new Date(),
  };
  
  workouts.set(workout.id, workout);
  res.json({ workout });
});

// Получить все тренировки пользователя
app.get('/api/workouts', authenticateToken, (req, res) => {
  const { limit, offset } = req.query;
  
  let userWorkouts = Array.from(workouts.values())
    .filter(w => w.userId === req.userId)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  
  const total = userWorkouts.length;
  
  if (limit) {
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset) || 0;
    userWorkouts = userWorkouts.slice(offsetNum, offsetNum + limitNum);
  }
  
  res.json({ workouts: userWorkouts, total });
});

// Получить одну тренировку
app.get('/api/workouts/:id', authenticateToken, (req, res) => {
  const workout = workouts.get(req.params.id);
  
  if (!workout) {
    return res.status(404).json({ error: 'Тренировка не найдена' });
  }
  
  if (workout.userId !== req.userId) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  
  res.json({ workout });
});

// Обновить тренировку
app.put('/api/workouts/:id', authenticateToken, (req, res) => {
  const workout = workouts.get(req.params.id);
  
  if (!workout) {
    return res.status(404).json({ error: 'Тренировка не найдена' });
  }
  
  if (workout.userId !== req.userId) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  
  const updated = {
    ...workout,
    ...req.body,
    id: workout.id, // Не меняем ID
    userId: workout.userId, // Не меняем userId
    updatedAt: new Date(),
  };
  
  workouts.set(workout.id, updated);
  res.json({ workout: updated });
});

// Удалить тренировку
app.delete('/api/workouts/:id', authenticateToken, (req, res) => {
  const workout = workouts.get(req.params.id);
  
  if (!workout) {
    return res.status(404).json({ error: 'Тренировка не найдена' });
  }
  
  if (workout.userId !== req.userId) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  
  workouts.delete(req.params.id);
  res.json({ success: true });
});

// Получить историю по упражнению
app.get('/api/workouts/exercise/:exerciseId', authenticateToken, (req, res) => {
  const { limit } = req.query;
  
  let exerciseWorkouts = Array.from(workouts.values())
    .filter(w => 
      w.userId === req.userId && 
      w.completedAt &&
      w.exercises && 
      w.exercises.some(ex => ex.exerciseId === req.params.exerciseId)
    )
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .map(w => ({
      workoutId: w.id,
      date: w.completedAt,
      exercise: w.exercises.find(ex => ex.exerciseId === req.params.exerciseId),
    }));
  
  if (limit) {
    exerciseWorkouts = exerciseWorkouts.slice(0, parseInt(limit));
  }
  
  res.json({ history: exerciseWorkouts });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NUBO Training API running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
});


