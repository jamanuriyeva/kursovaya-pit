# 📝 NoteKeeper

Веб-приложение для создания и управления заметками. Проект демонстрирует контейнеризацию многокомпонентного приложения с использованием Docker Compose, reverse-proxy на базе NGINX и автоматическое получение HTTPS-сертификатов через Let's Encrypt.

## Архитектура

| Компонент | Технология | Назначение |
|-----------|------------|------------|
| Frontend | Nginx + HTML/CSS/JS | Пользовательский интерфейс |
| Backend | Node.js + Express.js | REST API, бизнес-логика |
| Database | PostgreSQL 15 | Хранение заметок |
| Reverse-proxy | NGINX | Маршрутизация, SSL-терминация |
| SSL | Let's Encrypt | Бесплатный HTTPS-сертификат |

```
        ┌─────────────────────────────────────────────┐
        │                  Браузер                     │
        └─────────────────────┬───────────────────────┘
                              │ HTTPS
                              ▼
        ┌─────────────────────────────────────────────┐
        │              NGINX (reverse-proxy)           │
        │              порты 80 → 443                  │
        └───────────────┬─────────────┬───────────────┘
                        │             │
                        ▼             ▼
        ┌───────────────────┐ ┌───────────────────┐
        │     Frontend      │ │     Backend       │
        │   (статический    │ │   (Express.js)    │
        │     Nginx)        │ │     порт 3000     │
        └───────────────────┘ └─────────┬─────────┘
                                        │
                                        ▼
                        ┌───────────────────────────┐
                        │      PostgreSQL           │
                        │      порт 5432            │
                        └───────────────────────────┘
```

## Требования

- Docker (версия 20.10 или выше)
- Docker Compose (плагин)
- Сервер с открытыми портами 80 и 443
- Домен, направленный на IP сервера (для HTTPS)

## Запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/ваш-username/note-app.git
cd note-app
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
nano .env
```

Содержимое:

```env
DOMAIN=ваш-домен.ru
LETSENCRYPT_EMAIL=ваша-почта@example.com
DB_USER=postgres
DB_PASSWORD=ваш-пароль
DB_NAME=notesdb
```

### 3. Запуск приложения

```bash
docker compose up -d
```

Проверьте статус контейнеров:

```bash
docker compose ps
```

**Ожидаемый результат:**

```
NAME                    STATUS    PORTS
note-app-backend-1      Up       3000/tcp
note-app-database-1     Up       5432/tcp
note-app-frontend-1     Up       80/tcp
note-app-nginx-1        Up       0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 4. Получение SSL-сертификата Let's Encrypt

Остановите NGINX для освобождения порта 80:

```bash
docker compose stop nginx
```

Установите Certbot (если не установлен):

```bash
apt update && apt install certbot -y
```

Получите сертификат:

```bash
certbot certonly --standalone -d ваш-домен.ru --email ваша-почта@example.com --non-interactive --agree-tos
```

Скопируйте сертификаты в папку проекта:

```bash
mkdir -p certs
cp /etc/letsencrypt/live/ваш-домен.ru/fullchain.pem certs/
cp /etc/letsencrypt/live/ваш-домен.ru/privkey.pem certs/
```

Запустите NGINX снова:

```bash
docker compose up -d nginx
```

### 5. Проверка работы

Откройте браузер по адресу:

```
https://ваш-домен.ru
```

Вы должны увидеть интерфейс приложения и зелёный замок 🔒 в адресной строке.

## 🔧 Команды управления

| Команда | Описание |
|---------|----------|
| `docker compose up -d` | Запуск всех сервисов в фоновом режиме |
| `docker compose down` | Остановка и удаление всех контейнеров |
| `docker compose logs -f` | Просмотр логов в реальном времени |
| `docker compose logs --tail=50` | Последние 50 строк логов |
| `docker compose restart` | Перезапуск всех сервисов |
| `docker compose exec backend sh` | Вход в контейнер бэкенда |

## API Endpoints

| Метод | URL | Описание | Пример тела запроса |
|-------|-----|----------|---------------------|
| GET | `/api/notes` | Получить все заметки | - |
| GET | `/api/notes/{id}` | Получить заметку по ID | - |
| POST | `/api/notes` | Создать заметку | `{"title":"Заголовок","content":"Текст"}` |
| PUT | `/api/notes/{id}` | Обновить заметку | `{"title":"Новый заголовок","content":"Новый текст"}` |
| DELETE | `/api/notes/{id}` | Удалить заметку | - |


## Структура проекта

```
note-app/
├── backend/
│   ├── Dockerfile          # инструкция сборки бэкенда
│   ├── package.json        # зависимости Node.js
│   └── server.js           # код REST API
├── frontend/
│   ├── Dockerfile          # инструкция сборки фронтенда
│   ├── nginx.conf          # конфигурация Nginx
│   ├── index.html          # HTML-страница
│   ├── style.css           # стили
│   └── script.js           # клиентская логика
├── docker-compose.yml      # оркестрация контейнеров
├── nginx.conf              # конфигурация reverse-proxy
├── .env                    # переменные окружения
└── README.md               # этот файл
```

