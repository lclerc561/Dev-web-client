<script setup>
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'

const authStore = useAuthStore()
</script>

<template>
  <Header v-if="authStore.apiKey" />

  <main class="main-content">
    <router-view />
  </main>
</template>

<style>
/* Style global de base pour toute l'application */
body {
  margin: 0;
  font-family: 'Segoe UI', Arial, sans-serif;
  background-color: #f4f7f6;
  color: #333;
}

.main-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
