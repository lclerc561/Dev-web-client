<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTrackerStore } from '@/stores/tracker'
import axios from '@/plugins/axios'

const authStore = useAuthStore()
const trackerStore = useTrackerStore()
const router = useRouter()

const timerDisplay = ref('')
let interval = null

function tick() {
  if (!trackerStore.enCours) {
    timerDisplay.value = ''
    return
  }
  const start = new Date(trackerStore.enCours.start).getTime()
  const diff = new Date().getTime() - start
  const h = Math.floor(diff / 3600000).toString().padStart(2, '0')
  const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
  const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
  timerDisplay.value = `${h}:${m}:${s}`
}

watch(() => trackerStore.enCours, (newVal) => {
  if (newVal) {
    if (!interval) interval = setInterval(tick, 1000)
    tick()
  } else {
    clearInterval(interval)
    interval = null
    timerDisplay.value = ''
  }
})

watch(() => authStore.apiKey, (newKey) => {
    if(newKey) trackerStore.refreshHeaderData()
}, { immediate: true })

const projectName = ref('')
const activityName = ref('')
watch(() => trackerStore.enCours, async (newVal) => {
    if(newVal) {
        try {
            const p = await axios.get(`/projects/${newVal.project_id}`)
            const a = await axios.get(`/activities/${newVal.activity_id}`)
            projectName.value = p.data.name
            activityName.value = a.data.name
        } catch (e) { projectName.value = '?'; activityName.value = '?' }
    }
})

function logout() {
  authStore.logout()
  trackerStore.$reset()
  router.push('/connexion')
}
</script>

<template>
  <div class="app-container">
    <header v-if="authStore.apiKey">
      <nav class="top-nav">
        <div class="brand">Timely!</div>
        <div class="links">
          <RouterLink to="/activite">Activité (Accueil)</RouterLink>
          <RouterLink to="/statistiques">Statistiques</RouterLink>
          
          <div class="dropdown">
            <span class="dropbtn">Paramètres Généraux ▼</span>
            <div class="dropdown-content">
                <RouterLink to="/profil">Mon Profil</RouterLink>
                <RouterLink to="/projets">Mes Projets</RouterLink>
                <RouterLink to="/config-activites">Types d'activités</RouterLink>
            </div>
          </div>
        </div>
        <button @click="logout" class="btn-logout">Déconnexion</button>
      </nav>

      <div class="status-bar">
        <div class="daily-stats">
            <span>Total jour : <strong>{{ trackerStore.totalHeuresJour }}</strong></span>
            <span class="sep">|</span>
            <span>Objectifs : <strong>{{ trackerStore.objectifs.faits }}/{{ trackerStore.objectifs.total }}</strong></span>
        </div>

        <div class="current-activity" :class="{ 'active': trackerStore.enCours }">
            <span v-if="!trackerStore.enCours">Aucune activité en cours</span>
            <span v-else>
                Encours : <strong>{{ projectName }}</strong> - {{ activityName }}
                <span class="live-timer">({{ timerDisplay }})</span>
            </span>
        </div>

        <div class="actions">
            <button v-if="trackerStore.enCours" @click="trackerStore.stopperActivite()" class="btn-stop-header">
                ■ STOP
            </button>
        </div>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container { font-family: 'Segoe UI', sans-serif; }
header { background-color: #333; color: white; display: flex; flex-direction: column; }

.top-nav { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-bottom: 1px solid #444; }
.brand { font-weight: bold; font-size: 1.4rem; color: #42b983; }
.links a { color: #ccc; margin: 0 10px; text-decoration: none; font-size: 0.95rem; }
.links a.router-link-active { color: white; font-weight: bold; }
.links a:hover { color: #42b983; }

.dropdown { display: inline-block; position: relative; cursor: pointer; color: #ccc; margin: 0 10px;}
.dropdown-content { display: none; position: absolute; background-color: #f9f9f9; min-width: 160px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); z-index: 1; border-radius: 4px; overflow: hidden; }
.dropdown-content a { color: black; padding: 12px 16px; text-decoration: none; display: block; margin: 0; }
.dropdown-content a:hover { background-color: #f1f1f1; }
.dropdown:hover .dropdown-content { display: block; }

.status-bar { background-color: #222; padding: 8px 20px; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; border-bottom: 2px solid #42b983; }

.daily-stats { display: flex; gap: 10px; color: #aaa; }
.daily-stats strong { color: white; }
.sep { color: #444; }

.current-activity { flex: 1; text-align: center; color: #888; transition: color 0.3s; }
.current-activity.active { color: #fff; text-shadow: 0 0 5px rgba(66, 185, 131, 0.5); }
.live-timer { font-family: monospace; font-weight: bold; color: #42b983; margin-left: 5px; }

.btn-stop-header { background: #ff4d4f; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.8rem; }
.btn-logout { background: transparent; border: 1px solid #d9534f; color: #d9534f; padding: 5px 10px; border-radius: 4px; cursor: pointer; transition: 0.2s; }
.btn-logout:hover { background: #d9534f; color: white; }
</style>