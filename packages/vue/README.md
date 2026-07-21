# `@formsreach/vue`

Vue and Nuxt composable for [FormsReach](https://formsreach.com) — form backend without a custom server.

[![npm](https://img.shields.io/npm/v/@formsreach/vue.svg)](https://www.npmjs.com/package/@formsreach/vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

For AI coding agents, see [AGENTS.md](./AGENTS.md) (composable API, form binding, do/don't).

Core transport is [`@formsreach/js`](../js).

## Install

```bash
npm install @formsreach/vue
```

## Usage

```vue
<script setup>
import { useFormsReach } from "@formsreach/vue";

const { submit, submitting } = useFormsReach("fr_your_key");
</script>

<template>
  <form @submit.prevent="submit">
    <input type="text" name="name" required />
    <input type="email" name="email" required />
    <textarea name="message" required />
    <button type="submit" :disabled="submitting">Submit Form</button>
  </form>
</template>
```

## Examples

- [Vue](../../examples/vue)
- [Nuxt](../../examples/nuxt)

## License

MIT
