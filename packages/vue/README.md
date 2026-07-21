# `@formsreach/vue`

Vue and Nuxt composable for [FormsReach](https://formsreach.com).

```bash
npm install @formsreach/vue
```

```vue
<script setup>
import { useFormsReach } from '@formsreach/vue';

const { submit, submitting } = useFormsReach('fr_your_key');
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
