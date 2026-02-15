<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/connexion')
}
</script>

<template>
  <div class="app-container">
    <header v-if="authStore.apiKey">
      <nav>
        <div class="brand">Timely!</div>
        <div class="links">
          <RouterLink to="/activite">Tableau de bord</RouterLink>
          <RouterLink to="/projets">Mes Projets</RouterLink>
          <RouterLink to="/profil">Mon Profil</RouterLink>
        </div>
        <button @click="logout" class="btn-logout">Déconnexion</button>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
header {
  background-color: #333;
  color: white;
  padding: 1rem;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand { font-weight: bold; font-size: 1.2rem; color: #42b983; }

.links a {
  color: white;
  margin: 0 10px;
  text-decoration: none;
}

.links a.router-link-active {
  font-weight: bold;
  text-decoration: underline;
  color: #42b983;
}

.btn-logout {
  background: #d9534f;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

main { padding: 20px; }
</style>