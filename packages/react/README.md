# `@formsreach/react`

React and Next.js hook for [FormsReach](https://formsreach.com) — form backend without a custom server.

[![npm](https://img.shields.io/npm/v/@formsreach/react.svg)](https://www.npmjs.com/package/@formsreach/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

For AI coding agents, see [AGENTS.md](./AGENTS.md) (hook API, Next.js notes, do/don't).

Core transport is [`@formsreach/js`](../js).

## Install

```bash
npm install @formsreach/react
```

## Usage

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

## Examples

- [React](../../examples/react)
- [Next.js](../../examples/nextjs)

## License

MIT
