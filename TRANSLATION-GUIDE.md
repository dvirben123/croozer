# Translation Implementation Guide - next-intl

## ✅ Setup Complete

The project now uses `next-intl` for internationalization. All Hebrew strings should be in `messages/he.json` and referenced via the `useTranslations` hook.

## 📦 Installation

```bash
pnpm install
```

This will install `next-intl` (already added to package.json).

## 🗂️ File Structure

```
croozer/
├── messages/
│   └── he.json          # Hebrew translations (complete)
├── i18n.ts              # next-intl configuration
├── next.config.ts       # Updated with next-intl plugin
└── app/
    └── components/
        └── onboarding/
            └── BusinessDetailsStep.tsx  # ✅ Example implementation
```

## 🎯 Implementation Example

### Before (Hardcoded Hebrew):
```tsx
export default function MyComponent() {
  return (
    <div>
      <h1>פרטי העסק</h1>
      <p>שם העסק הוא שדה חובה</p>
    </div>
  );
}
```

### After (Using Translations):
```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('onboarding.businessDetails');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('nameRequired')}</p>
    </div>
  );
}
```

## 📝 Translation Keys Structure

All onboarding translations are in `messages/he.json`:

```json
{
  "onboarding": {
    "businessDetails": { ... },
    "category": { ... },
    "menu": { ... },
    "whatsapp": { ... },
    "payment": { ... },
    "conversation": { ... },
    "completion": { ... }
  },
  "common": {
    "loading": "טוען...",
    "saving": "שומר...",
    ...
  }
}
```

## 🔧 Components to Update

### ✅ Already Updated:
- `BusinessDetailsStep.tsx` - Complete example

### ⏳ Need to Update:

1. **CategorySelectionStep.tsx**
   ```tsx
   const t = useTranslations('onboarding.category');
   // Replace: "בחר את סוג העסק" → {t('title')}
   // Replace: "מסעדה" → {t('restaurant.title')}
   ```

2. **MenuBuilderStep.tsx**
   ```tsx
   const t = useTranslations('onboarding.menu');
   // Replace: "בניית התפריט" → {t('title')}
   // Replace: "התפריט שלך ריק" → {t('empty.title')}
   ```

3. **WhatsAppSetupStep.tsx**
   ```tsx
   const t = useTranslations('onboarding.whatsapp');
   // Replace: "חיבור וואטסאפ" → {t('title')}
   // Replace: "חבר וואטסאפ עסקי" → {t('connectButton')}
   ```

4. **PaymentSetupStep.tsx**
   ```tsx
   const t = useTranslations('onboarding.payment');
   // Replace: "הגדרת תשלומים" → {t('title')}
   // Replace: "Stripe" → {t('providers.stripe.name')}
   ```

5. **ConversationFlowStep.tsx**
   ```tsx
   const t = useTranslations('onboarding.conversation');
   // Replace: "הגדרת שיחה אוטומטית" → {t('title')}
   ```

6. **CompletionStep.tsx**
   ```tsx
   const t = useTranslations('onboarding.completion');
   // Replace: "כל הכבוד! ההגדרה הושלמה" → {t('title')}
   ```

7. **WizardStepper.tsx**
   ```tsx
   const t = useTranslations('onboarding.steps');
   // Update step titles to use translations
   ```

8. **onboarding/page.tsx**
   ```tsx
   const t = useTranslations('onboarding');
   // Replace: "הגדרת העסק שלך" → {t('title')}
   ```

## 🎨 Common Patterns

### Simple Text:
```tsx
<h1>{t('title')}</h1>
```

### With Variables:
```tsx
// In he.json: "productsCount": "{count} מוצרים בתפריט"
<p>{t('productsCount', { count: products.length })}</p>
```

### Conditional Text:
```tsx
<Button>
  {isLoading ? t('saving') : t('continue')}
</Button>
```

### Nested Keys:
```tsx
const t = useTranslations('onboarding.category');
<h2>{t('restaurant.title')}</h2>
<p>{t('restaurant.description')}</p>
```

### Common Translations:
```tsx
const tCommon = useTranslations('common');
<Button>{tCommon('save')}</Button>
<span>{tCommon('loading')}</span>
```

## 🌍 Adding English (Future)

1. Create `messages/en.json`:
```json
{
  "onboarding": {
    "title": "Set Up Your Business",
    "businessDetails": {
      "title": "Business Details",
      ...
    }
  }
}
```

2. Update `i18n.ts` to support locale selection:
```typescript
export default getRequestConfig(async ({ locale }) => {
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

3. Add locale switcher in UI.

## 🚀 Quick Migration Steps

For each component:

1. **Add import:**
   ```tsx
   import { useTranslations } from 'next-intl';
   ```

2. **Add hook:**
   ```tsx
   const t = useTranslations('onboarding.yourSection');
   ```

3. **Replace strings:**
   - Find all Hebrew strings in JSX
   - Look up the key in `messages/he.json`
   - Replace with `{t('key')}`

4. **Test:**
   - Component should display same text
   - No hardcoded Hebrew strings remain

## ✅ Checklist

After updating each component:

- [ ] Import `useTranslations`
- [ ] Add translation hook
- [ ] Replace all Hebrew strings
- [ ] Test component renders correctly
- [ ] Check for any missed strings
- [ ] Verify error messages use translations
- [ ] Confirm placeholders use translations

## 🐛 Troubleshooting

**Error: "Cannot find module 'next-intl'"**
- Run: `pnpm install`

**Error: "Translation key not found"**
- Check the key exists in `messages/he.json`
- Verify the namespace is correct (e.g., 'onboarding.menu')

**Text not showing:**
- Ensure component is client component (`"use client"`)
- Check translation key path is correct

**TypeScript errors:**
- Run: `pnpm run type-check`
- Ensure all translation keys exist

## 📚 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Translation Keys Reference](./messages/he.json)
- [Example Implementation](./app/components/onboarding/BusinessDetailsStep.tsx)

## 🎯 Priority Order

Update components in this order:

1. ✅ BusinessDetailsStep (Done)
2. CategorySelectionStep
3. MenuBuilderStep  
4. WhatsAppSetupStep
5. PaymentSetupStep
6. ConversationFlowStep
7. CompletionStep
8. WizardStepper
9. onboarding/page.tsx

---

**Status**: Setup complete, BusinessDetailsStep migrated as example.  
**Next**: Update remaining 8 components following the pattern.

