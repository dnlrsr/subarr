# Internationalization (i18n)

This project uses `react-i18next` for internationalization support.

## Setup

The i18n configuration is set up in `/src/i18n/config.ts` and automatically imported in `index.tsx`.

## Adding New Languages

1. Create a new translation file in `/src/i18n/locales/` (e.g., `es.json` for Spanish)
2. Copy the structure from `en.json` and translate the values
3. Import and add the new language in `/src/i18n/config.ts`:

```typescript
import esTranslation from './locales/es.json';

const resources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
};
```

## Using Translations in Components

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('common.description', { name: 'World' })}</p>
    </div>
  );
};
```

## Translation Keys Structure

- `common.*` - Common UI elements (buttons, labels, etc.)
- `header.*` - Header component strings
- `sidebar.*` - Sidebar navigation items
- `pages.*` - Page-specific content
- `searchResults.*` - Search functionality
- `subscriptionsPage.*` - Subscriptions page content
- `addPlaylistPage.*` - Add playlist page content
- `settingsPage.*` - Settings page content
- `postProcessorDialog.*` - Post processor dialog content
- `updateDialog.*` - Update notification content
- `toast.*` - Toast notification messages

## Interpolation

For dynamic content, use interpolation:

```json
{
  "welcome": "Welcome, {{username}}!"
}
```

```typescript
t('welcome', { username: 'John' })
```
