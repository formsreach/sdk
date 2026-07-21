# Next.js example

Use a client component with `@formsreach/react`:

```tsx
'use client';

import { useFormsReach } from '@formsreach/react';

export default function ContactForm() {
  const { submit, submitting } = useFormsReach(process.env.NEXT_PUBLIC_FORMSREACH_KEY!);

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
