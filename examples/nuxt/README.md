# Nuxt example

```vue
<script setup>
import { useFormsReach } from '@formsreach/vue';

const config = useRuntimeConfig();
const { submit, submitting } = useFormsReach(config.public.formsreachKey);
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
