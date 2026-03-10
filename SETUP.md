# Быстрый старт — Invoicerly

## Требования

- Node.js 18+
- npm или yarn

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск дев-сервера
npm run dev

# Сборка продакшн-бандла
npm run build

# Запуск продакшн-сервера
npm start
```

## Структура проекта

```
src/
  app/                    # Next.js App Router
    globals.css           # Глобальные стили
    layout.tsx            # Корневой макет (Header/Footer подключены здесь)
    page.tsx              # Главная страница
    generator/page.tsx    # Страница генератора счетов
  components/             # Компоненты
    layout/               # Header, Footer, Section
    sections/             # Hero, Pricing, Testimonials, Contact и т.д.
    ui/                   # Button, Input, Textarea, Card
    demo/                 # Демо-компоненты
  lib/                    # Данные/настройки (theme, data)
  types/                  # Типы TypeScript
```

## Переменные окружения (опционально)

Скопируйте `env.example` в `.env.local` и заполните при необходимости.

## Полезное

- Главный навбар и футер рендерятся из `src/app/layout.tsx` — видны на всех страницах.
- Секции лендинга доступны якорями: `/#pricing`, `/#contact`.
- Генератор поддерживает выбор региона/страны/валюты и расчет сумм/налога в превью.

