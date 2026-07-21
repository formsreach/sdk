# `@formsreach/react`

React and Next.js hook for [FormsReach](https://formsreach.com).

For AI coding agents, see [AGENTS.md](./AGENTS.md) (hook API, Next.js notes, do/don't).

```bash
npm install @formsreach/react
```

```tsx
"use client"; // Next.js App Router

import { useFormsReach } from "@formsreach/react";

export default function ContactForm() {
  const { submit, submitting } = useFormsReach("fr_your_key");

  return (
    <form onSubmit={submit}>
      <input type="text" name="name" required />
      <input type="email" name="email" required />
      <textarea name="message" required />
      <button type="submit" disabled={submitting}>
        Submit Form
      </button>
    </form>
  );
}
```
