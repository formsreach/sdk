# Vue example

```vue
<script setup>
import { useFormsReach } from '@formsreach/vue';

const { submit, submitting } = useFormsReach(import.meta.env.VITE_FORMSREACH_KEY);
</script>

<template>
  <form @submit.prevent="submit">
    <input name="name" required />
    <input name="email" type="email" required />
    <textarea name="message" required />
    <button type="submit" :disabled="submitting">Submit</button>
  </form>
</template>
```
