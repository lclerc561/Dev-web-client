<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTrackerStore } from '@/stores/tracker'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const trackerStore = useTrackerStore()
const router = useRouter()

const timerDisplay = ref('00:00:00')
let intervalId = null

// Gestion du chrono global dans le header
function updateTimer() {
  if (!trackerStore.enCours) return
  const start = new Date(trackerStore.enCours.start).getTime()
  const diff = new Date().getTime() - start
  const h = Math.floor(diff / 3600000).toString().padStart(2, '0')
  const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
  const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
  timerDisplay.value = `${h}:${m}:${s}`
}

watch(() => trackerStore.enCours, (newVal) => {
  clearInterval(intervalId)
  if (newVal) {
    intervalId = setInterval(updateTimer, 1000)
  } else {
    timerDisplay.value = '00:00:00'
  }
}, { immediate: true })

function deconnexion() {
  authStore.logout()
  router.push('/connexion')
}

onMounted(() => {
  if (authStore.apiKey) trackerStore.refreshHeaderData()
})

onUnmounted(() => clearInterval(intervalId))
</script>

<template>
  <header class="app-header">
    <div class="top-bar">
      <h1>⏱️ Timely</h1>

      <div class="global-stats">
        <span class="stat-badge">Total: {{ trackerStore.totalHeuresJour }}</span>
        <span class="stat-badge">🎯 Obj: {{ trackerStore.objectifs.faits }}/{{ trackerStore.objectifs.total }}</span>
      </div>

      <div class="user-actions">
        <span>{{ authStore.user?.name || 'Utilisateur' }}</span>
        <button @click="deconnexion" class="btn-logout">Déconnexion</button>
      </div>
    </div>

    <nav class="main-nav">
      <router-link to="/activite">Accueil (Tracker)</router-link>
      <router-link to="/statistiques">Statistiques</router-link>
      <router-link to="/projets">Mes Projets</router-link>
      <router-link to="/config-activites">Mes Activités</router-link>
      <router-link to="/profil">Mon Profil</router-link>
    </nav>

    <div v-if="trackerStore.enCours" class="active-banner">
      <div class="pulse-indicator"></div>
      <span class="active-text">
        Activité en cours : <strong>{{ timerDisplay }}</strong>
      </span>
      <button @click="trackerStore.stopperActivite()" class="btn-stop-mini">■ STOP</button>
    </div>
  </header>
</template>

<style scoped>
.app-header { background: #2c3e50; color: white; padding: 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
.top-bar { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; }
.top-bar h1 { margin: 0; font-size: 1.5rem; color: #42b983; }
.global-stats { display: flex; gap: 15px; }
.stat-badge { background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 20px; font-size: 0.9em; font-weight: bold; }
.user-actions { display: flex; align-items: center; gap: 15px; }
.btn-logout { background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.main-nav { display: flex; background: #34495e; padding: 0 20px; }
.main-nav a { color: #ecf0f1; text-decoration: none; padding: 12px 15px; border-bottom: 3px solid transparent; transition: 0.2s; }
.main-nav a.router-link-active { border-bottom-color: #42b983; font-weight: bold; background: rgba(255,255,255,0.05); }
.active-banner { background: #42b983; color: white; padding: 10px 20px; display: flex; align-items: center; justify-content: center; gap: 15px; }
.pulse-indicator { width: 10px; height: 10px; background: red; border-radius: 50%; animation: pulse 1s infinite; }
.btn-stop-mini { background: #c0392b; color: white; border: none; padding: 5px 15px; border-radius: 15px; cursor: pointer; font-weight: bold; }
@keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); } }
</style>
