<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/plugins/axios'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

const today = new Date().toISOString().split('T')[0]
const projets = ref([])
const activitesRef = ref([])
const filters = ref({ from: today, to: today, project_id: '' })
const entries = ref([])
const pagination = ref({ page: 1, rowsPerPage: 5 })

const stats = computed(() => {
  const projDist = {}
  const actDist = {}
  let totalMs = 0

  // SÉCURITÉ 1 : On garantit qu'on boucle sur un vrai tableau
  const safeEntries = Array.isArray(entries.value) ? entries.value : []

  safeEntries.forEach(e => {
    if (!e.end) return
    const duration = new Date(e.end) - new Date(e.start)
    totalMs += duration
    projDist[e.project_id] = (projDist[e.project_id] || 0) + duration
    actDist[e.activity_id] = (actDist[e.activity_id] || 0) + duration
  })

  return { projDist, actDist, totalH: (totalMs / 3600000).toFixed(2) }
})

async function fetchData() {
  try {
    const [resProjs, resActs, resEntries] = await Promise.all([
      axios.get('/projects'),
      axios.get('/activities'),
      axios.get('/time-entries', {
        params: {
          from: filters.value.from,
          to: filters.value.to,
          project_id: filters.value.project_id || undefined,
          page: pagination.value.page,
          rowsPerPage: pagination.value.rowsPerPage
        }
      })
    ])

    projets.value = resProjs.data
    activitesRef.value = resActs.data

    // SÉCURITÉ 2 : On extrait intelligemment le tableau, peu importe le format de la pagination
    let rawData = resEntries.data
    if (rawData && !Array.isArray(rawData)) {
      rawData = rawData.data || rawData.items || []
    }
    entries.value = Array.isArray(rawData) ? rawData : []

  } catch (e) {
    console.error("Erreur de chargement", e)
  }
}

const chartProjets = computed(() => ({
  labels: Object.keys(stats.value.projDist).map(id => projets.value.find(p => p.id == id)?.name || id),
  datasets: [{ data: Object.values(stats.value.projDist), backgroundColor: ['#41B883', '#E46651', '#00D8FF'] }]
}))

const chartActivites = computed(() => ({
  labels: Object.keys(stats.value.actDist).map(id => activitesRef.value.find(a => a.id == id)?.name || id),
  datasets: [{
    data: Object.values(stats.value.actDist),
    backgroundColor: Object.keys(stats.value.actDist).map(id => activitesRef.value.find(a => a.id == id)?.color || '#ccc')
  }]
}))

onMounted(fetchData)
</script>

<template>
  <div class="reporting">
    <h2>📊 Reporting / Statistiques</h2>

    <div class="filters">
      <input type="date" v-model="filters.from" @change="fetchData">
      <input type="date" v-model="filters.to" @change="fetchData">
      <select v-model="filters.project_id" @change="fetchData">
        <option value="">Tous les projets</option>
        <option v-for="p in projets" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>

    <div class="summary">
      <p>Temps total travaillé : <strong>{{ stats.totalH }}h</strong></p>
    </div>

    <div class="charts">
      <div v-if="!filters.project_id" class="chart-item">
        <h3>Par Projet</h3>
        <Pie :data="chartProjets" />
      </div>
      <div class="chart-item">
        <h3>Par Type d'activité</h3>
        <Pie :data="chartActivites" />
      </div>
    </div>

    <div class="logs">
      <h3>Détail des entrées (Page {{ pagination.page }})</h3>
      <div v-for="e in entries" :key="e.id" class="log-row">
        {{ e.start }} - {{ e.comment || '(Sans note)' }}
      </div>
      <div class="pagination-btns">
        <button @click="pagination.page--; fetchData()" :disabled="pagination.page <= 1">Précédent</button>
        <button @click="pagination.page++; fetchData()">Suivant</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.charts { display: flex; gap: 20px; flex-wrap: wrap; }
.chart-item { width: 300px; text-align: center; }
.log-row { padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9em; }
.pagination-btns { margin-top: 15px; display: flex; gap: 10px; }
</style>
