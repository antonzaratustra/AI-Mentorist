# Supabase Setup

## Что уже ожидает код

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — пока не используется в рантайме, но оставлен под будущие server-only задачи

Пример значений лежит в `.env.example`. Для локальной разработки создай `.env.local`.

## Где взять значения

### Supabase

В панели проекта открой `Project Settings -> API`.

- `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
- `Publishable key` -> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `service_role secret` -> `SUPABASE_SERVICE_ROLE_KEY`

### Google OAuth

В Google Cloud Console открой `APIs & Services -> Credentials` и создай `OAuth Client ID`.

- `Client ID` и `Client Secret` вставляются не в `.env.local`, а в настройках провайдера Google внутри Supabase

## Что настроить в Supabase

### 1. Выполнить SQL

Открой `SQL Editor` и выполни содержимое `supabase/mentorist_schema.sql`.

### 2. Включить Google provider

Открой `Authentication -> Providers -> Google`.

- Включи провайдера
- Вставь `Client ID`
- Вставь `Client Secret`

### 3. URL configuration

Открой `Authentication -> URL Configuration`.

- `Site URL`: `http://127.0.0.1:3000`
- `Redirect URLs`: добавь `http://127.0.0.1:3000/auth/callback`

Для production добавь свой боевой домен и его callback-адрес.

## Что настроить в Google Cloud Console

В OAuth client добавь:

- `Authorized JavaScript origins`: `http://127.0.0.1:3000`
- `Authorized redirect URIs`: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

Важно: Google возвращает пользователя в Supabase callback, а уже Supabase перенаправляет его обратно в приложение на `/auth/callback`.

## Какой flow сейчас реализован

1. Лендинг `/`
2. Вход через Google
3. `auth/callback` обменивает код на session cookie
4. Пользователь попадает на `/welcome`
5. Welcome-screen сохраняет стартовый баланс и базовые ответы в Supabase
6. Кабинет `/workspace` загружает существующий state и синхронизирует изменения в фоне
