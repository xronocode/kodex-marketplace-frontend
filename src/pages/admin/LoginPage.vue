<!--
MODULE_CONTRACT: Render the admin login page and submit credentials through the admin auth feature.
SCOPE: Username/password form, stable auth error display, and login submission only.
DEPENDS: @/features/admin-auth
LINKS: [LoginPage][submit][BLOCK_SUBMIT_LOGIN]

MODULE_MAP:
- LoginPage - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_MODULE
Admin login page boundary for the frontend admin area.
END_BLOCK_MODULE
START_BLOCK_SUBMIT_LOGIN
Submit admin credentials through the shared admin auth composable and surface its stable error.
END_BLOCK_SUBMIT_LOGIN
CHANGE_SUMMARY: Adds the Russian-language admin login page with a minimal credential form.
-->
<script setup lang="ts">
import { ref } from 'vue';

import { useAdminAuth } from '@/features/admin-auth';

const auth = useAdminAuth();
const { error } = auth;

const username = ref('');
const password = ref('');
const isSubmitting = ref(false);

async function handleSubmit(): Promise<void> {
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    await auth.login(username.value.trim(), password.value);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <main class="admin-login">
    <section class="admin-login__card">
      <p class="admin-login__eyebrow">Админ-панель</p>
      <h1 class="admin-login__title">Вход</h1>
      <p class="admin-login__text">Введите логин и пароль администратора.</p>

      <form
        class="admin-login__form"
        @submit.prevent="handleSubmit"
      >
        <label class="admin-login__field">
          <span>Логин</span>
          <input
            v-model="username"
            autocomplete="username"
            name="username"
            type="text"
          >
        </label>

        <label class="admin-login__field">
          <span>Пароль</span>
          <input
            v-model="password"
            autocomplete="current-password"
            name="password"
            type="password"
          >
        </label>

        <p
          v-if="error"
          class="admin-login__error"
          role="alert"
        >
          {{ error }}
        </p>

        <button
          class="admin-login__submit"
          :disabled="isSubmitting"
          type="submit"
        >
          {{ isSubmitting ? 'Входим...' : 'Войти' }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.admin-login {
  align-items: center;
  background:
    radial-gradient(circle at top, rgba(15, 23, 42, 0.08), transparent 42%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  display: grid;
  min-height: 100vh;
  padding: 1.5rem;
}

.admin-login__card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.08);
  margin: 0 auto;
  max-width: 28rem;
  padding: 1.5rem;
  width: 100%;
}

.admin-login__eyebrow {
  color: #64748b;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0 0 0.5rem;
  text-transform: uppercase;
}

.admin-login__title {
  color: #0f172a;
  font-size: 2rem;
  line-height: 1.1;
  margin: 0;
}

.admin-login__text {
  color: #475569;
  margin: 0.5rem 0 1.25rem;
}

.admin-login__form {
  display: grid;
  gap: 1rem;
}

.admin-login__field {
  display: grid;
  gap: 0.45rem;
}

.admin-login__field span {
  color: #334155;
  font-size: 0.9375rem;
  font-weight: 600;
}

.admin-login__field input {
  border: 1px solid #cbd5e1;
  border-radius: 0.875rem;
  font-size: 1rem;
  padding: 0.8rem 0.9rem;
  width: 100%;
}

.admin-login__error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.875rem;
  color: #b91c1c;
  margin: 0;
  padding: 0.75rem 0.9rem;
}

.admin-login__submit {
  background: #0f172a;
  border: 0;
  border-radius: 0.875rem;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  padding: 0.9rem 1rem;
}

.admin-login__submit:disabled {
  opacity: 0.7;
}
</style>
