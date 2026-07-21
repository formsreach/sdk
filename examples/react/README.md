# React example

Scaffold with Vite + React when ready:

```bash
pnpm create vite . --template react-ts
pnpm add @formsreach/react
```

Minimal form:

```tsx
import { useFormsReach } from '@formsreach/react';

export function ContactForm() {
  const { submit, submitting } = useFormsReach(import.meta.env.VITE_FORMSREACH_KEY);

  return (
    <form onSubmit={submit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit" disabled={submitting}>Submit</button>
    </form>
  );
}
```
