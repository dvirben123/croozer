# React Hook Form Pattern for Wizard Steps

## ✅ Why Use React Hook Form?

- **Better validation** - Built-in validation rules
- **Less boilerplate** - No manual state management
- **Better performance** - Uncontrolled components
- **Type-safe** - Full TypeScript support
- **Cleaner code** - Less code to maintain

## 📝 Pattern (BusinessDetailsStep Example)

### Before (Manual State):
```tsx
const [formData, setFormData] = useState({ name: '', email: '' });
const [errors, setErrors] = useState({});

const validate = () => {
  const newErrors = {};
  if (!formData.name) newErrors.name = 'Required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleNext = async () => {
  if (!validate()) return;
  updateData(formData);
  await saveProgress();
  nextStep();
};

<Input
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
/>
{errors.name && <p>{errors.name}</p>}
```

### After (React Hook Form):
```tsx
const { register, handleSubmit, formState: { errors } } = useForm({
  defaultValues: { name: data.name || '', email: data.email || '' }
});

const onSubmit = async (formData) => {
  updateData(formData);
  await saveProgress();
  nextStep();
};

<form onSubmit={handleSubmit(onSubmit)}>
  <Input
    {...register('name', { required: 'Required' })}
  />
  {errors.name && <p>{errors.name.message}</p>}
  <Button type="submit">Continue</Button>
</form>
```

## 🎯 Step-by-Step Migration

### 1. Import Dependencies
```tsx
import { useForm } from 'react-hook-form';
```

### 2. Define Form Interface
```tsx
interface YourFormData {
  field1: string;
  field2: string;
  // ... all form fields
}
```

### 3. Setup useForm Hook
```tsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<YourFormData>({
  defaultValues: {
    field1: data.field1 || '',
    field2: data.field2 || '',
  },
});
```

### 4. Create onSubmit Handler
```tsx
const onSubmit = async (formData: YourFormData) => {
  updateData(formData);
  try {
    await saveProgress();
    nextStep();
  } catch (error) {
    console.error('Failed to save:', error);
  }
};
```

### 5. Wrap Form with <form> Tag
```tsx
<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
  {/* form fields */}
  <Button type="submit">Continue</Button>
</form>
```

### 6. Register Inputs
```tsx
// Simple field
<Input {...register('name')} />

// With validation
<Input
  {...register('email', {
    required: 'Email is required',
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: 'Invalid email'
    }
  })}
/>

// With error display
{errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
```

## 🔧 Validation Rules

### Required Field:
```tsx
{...register('name', {
  required: t('nameRequired')
})}
```

### Pattern Validation:
```tsx
{...register('phone', {
  required: t('phoneRequired'),
  pattern: {
    value: /^[\d\s\-\+\(\)]+$/,
    message: t('phoneInvalid')
  }
})}
```

### Min/Max Length:
```tsx
{...register('password', {
  required: 'Password required',
  minLength: {
    value: 8,
    message: 'Minimum 8 characters'
  }
})}
```

### Custom Validation:
```tsx
{...register('age', {
  validate: (value) => {
    return value >= 18 || 'Must be 18 or older';
  }
})}
```

## 📋 Components to Update

### ✅ Already Updated:
1. **BusinessDetailsStep.tsx** - Complete with react-hook-form

### ⏳ Need to Update:

2. **CategorySelectionStep.tsx**
```tsx
interface CategoryForm {
  category: 'restaurant' | 'fast_food';
}

const { register, handleSubmit } = useForm<CategoryForm>({
  defaultValues: { category: data.category }
});
```

3. **MenuBuilderStep.tsx**
```tsx
// This step is more complex - uses product list
// May not need form validation
```

4. **WhatsAppSetupStep.tsx**
```tsx
// This step uses a button click, not a form
// May not need react-hook-form
```

5. **PaymentSetupStep.tsx**
```tsx
// Similar to WhatsApp - button-based
// May not need react-hook-form
```

6. **ConversationFlowStep.tsx**
```tsx
interface ConversationForm {
  welcomeMessage: string;
}

const { register, handleSubmit } = useForm<ConversationForm>({
  defaultValues: { welcomeMessage: data.welcomeMessage }
});
```

## 💡 Tips

### 1. **Error Display Pattern:**
```tsx
<Input
  {...register('field', { required: 'Required' })}
  className={errors.field ? 'border-red-500' : ''}
/>
{errors.field && (
  <p className="text-sm text-red-500">{errors.field.message}</p>
)}
```

### 2. **Translation Integration:**
```tsx
const t = useTranslations('onboarding.step');

{...register('name', {
  required: t('nameRequired'),
  pattern: {
    value: /pattern/,
    message: t('nameInvalid')
  }
})}
```

### 3. **Optional Fields:**
```tsx
// No validation rules needed
<Input {...register('optionalField')} />
```

### 4. **Disabled Submit:**
```tsx
<Button
  type="submit"
  disabled={isLoading || isSubmitting}
>
  {isLoading ? 'Saving...' : 'Continue'}
</Button>
```

### 5. **Form Reset (if needed):**
```tsx
const { reset } = useForm();

// Reset to default values
reset();

// Reset to new values
reset({ name: 'New Name' });
```

## 🎨 Complete Example

```tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MyStepForm {
  field1: string;
  field2: string;
}

export default function MyStep() {
  const t = useTranslations("onboarding.myStep");
  const { data, updateData, nextStep, previousStep, saveProgress, isLoading } =
    useOnboarding();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MyStepForm>({
    defaultValues: {
      field1: data.field1 || "",
      field2: data.field2 || "",
    },
  });

  const onSubmit = async (formData: MyStepForm) => {
    updateData(formData);

    try {
      await saveProgress();
      nextStep();
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Field 1 */}
        <div className="space-y-2">
          <Label htmlFor="field1">{t("field1Label")} *</Label>
          <Input
            id="field1"
            {...register("field1", {
              required: t("field1Required"),
            })}
            placeholder={t("field1Placeholder")}
            className={errors.field1 ? "border-red-500" : ""}
          />
          {errors.field1 && (
            <p className="text-sm text-red-500">{errors.field1.message}</p>
          )}
        </div>

        {/* Field 2 */}
        <div className="space-y-2">
          <Label htmlFor="field2">{t("field2Label")}</Label>
          <Input
            id="field2"
            {...register("field2")}
            placeholder={t("field2Placeholder")}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={previousStep}
            disabled={isLoading}
          >
            {t("back")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("saving") : t("continue")}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

## 🚀 Benefits Achieved

- ✅ **Less code** - 30-40% reduction
- ✅ **Better validation** - Built-in rules
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Better UX** - Real-time validation
- ✅ **Cleaner** - No manual state management
- ✅ **Maintainable** - Standard pattern

## 📚 Resources

- [React Hook Form Docs](https://react-hook-form.com/)
- [Validation Rules](https://react-hook-form.com/api/useform/register)
- [TypeScript Support](https://react-hook-form.com/ts)

---

**Status**: BusinessDetailsStep migrated ✅  
**Next**: Update remaining form-based steps following this pattern














