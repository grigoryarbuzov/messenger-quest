# Деплой на Beget

## Требования

- SSH доступ к серверу Beget
- Node.js версии 14+ на сервере
- Git установлен на сервере

## Пошаговая инструкция

### 1. Проверка доступа к серверу

Подключитесь к серверу по SSH:
```bash
ssh username@your-domain.beget.tech
```

Проверьте версию Node.js:
```bash
node --version
npm --version
```

Если Node.js нет, обратитесь в поддержку Beget для активации.

### 2. Клонирование репозитория на сервер

На сервере перейдите в директорию сайта:
```bash
cd ~/your-domain.ru/public_html
```

Клонируйте репозиторий:
```bash
git clone https://github.com/grigoryarbuzov/messenger-quest.git
cd messenger-quest
```

### 3. Установка зависимостей

```bash
npm install
```

### 4. Настройка переменных окружения

Создайте файл `.env.local`:
```bash
nano .env.local
```

Добавьте:
```
OPENROUTER_API_KEY=ваш_ключ_здесь
DATABASE_URL=file:./game.db
NEXT_PUBLIC_APP_URL=https://ваш-домен.ru
```

Сохраните (Ctrl+O, Enter, Ctrl+X).

### 5. Инициализация базы данных

```bash
npm run db:init
```

### 6. Сборка приложения

```bash
npm run build
```

### 7. Запуск приложения

**Вариант A: Через PM2 (рекомендуется)**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Вариант B: Через nohup**
```bash
nohup npm start > app.log 2>&1 &
```

### 8. Настройка веб-сервера

В панели управления Beget:
1. Перейдите в "Сайты" → "Управление сайтами"
2. Найдите ваш домен
3. Включите "Проксирование Node.js приложения"
4. Укажите порт: **3000**
5. Укажите путь к приложению: `/home/username/your-domain.ru/public_html/messenger-quest`

### 9. Проверка

Откройте ваш сайт в браузере: `https://ваш-домен.ru`

## Обновление приложения

При внесении изменений:
```bash
cd ~/your-domain.ru/public_html/messenger-quest
git pull
npm install
npm run build
pm2 restart messenger-quest
```

## Решение проблем

### Приложение не запускается
```bash
# Проверьте логи PM2
pm2 logs messenger-quest

# Или проверьте app.log
tail -f app.log
```

### Проблемы с портом
Убедитесь, что порт 3000 свободен:
```bash
netstat -tuln | grep 3000
```

### База данных не создается
```bash
# Проверьте права доступа
chmod 755 .
chmod 664 game.db
```
