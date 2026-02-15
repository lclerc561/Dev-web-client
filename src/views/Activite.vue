<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from '@/plugins/axios'

const projets = ref([])
const typesActivites = ref([])
const historique = ref([])
const enCours = ref(null)
const timerDisplay = ref('00:00:00')
let intervalId = null

const form = ref({ project_id: '', activity_id: '', comment: '' })

const nouveauType = ref({ name: '', color: '#42b983' })

async function init() {
  try {
    const [resProj, resTypes, resTime] = await Promise.all([
      axios.get('/projects'),
      axios.get('/activities'),
      axios.get('/time-entries')
    ])

    projets.value = resProj.data
    typesActivites.value = resTypes.data
    const allEntries = resTime.data
    const current = allEntries.find(e => !e.end)
    if (current) {
      enCours.value = current
      demarrerCompteurVisuel(current.start)
    }
    historique.value = allEntries.filter(e => e.end).reverse()
  } catch (e) {
    console.error("Erreur chargement", e)
  }
}

async function creerType() {
  if (!nouveauType.value.name) return alert("Nom obligatoire")
  try {
    await axios.post('/activities', nouveauType.value)
    nouveauType.value.name = ''
    const res = await axios.get('/activities')
    typesActivites.value = res.data
  } catch (e) { alert("Erreur création type") }
}

async function demarrer() {
  if (!form.value.project_id || !form.value.activity_id) return alert("Sélectionnez Projet et Activité")

  try {
    const res = await axios.post('/time-entries', { // 
      project_id: form.value.project_id,
      activity_id: form.value.activity_id,
      comment: form.value.comment,
      start: new Date().toISOString()
    })

    enCours.value = res.data
    demarrerCompteurVisuel(enCours.value.start)
    form.value.comment = ''
  } catch (e) { alert("Impossible de démarrer") }
}

async function stopper() {
  if (!enCours.value) return
  try {
    await axios.patch(`/time-entries/${enCours.value.id}/stop`) // 
    clearInterval(intervalId)
    enCours.value = null
    timerDisplay.value = '00:00:00'
    init()
  } catch (e) { alert("Erreur arrêt") }
}

function demarrerCompteurVisuel(dateStart) {
  clearInterval(intervalId)
  const start = new Date(dateStart).getTime()

  intervalId = setInterval(() => {
    const diff = new Date().getTime() - start
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0')
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
    timerDisplay.value = `${h}:${m}:${s}`
  }, 1000)
}

const getProjName = (id) => projets.value.find(p => p.id === id)?.name || '?'
const getType = (id) => typesActivites.value.find(t => t.id === id) || { name: '?', color: '#ccc' }

onMounted(init)
onUnmounted(() => clearInterval(intervalId))
</script>

<template>
  <div class="dashboard">
    <h2>Tableau de bord</h2>

    <div class="quick-add-type">
      <details>
        <summary>Créer un nouveau type d'activité</summary>
        <div class="add-box">
          <input v-model="nouveauType.name" placeholder="Nom (ex: Dev, Réunion)" />
          <input type="color" v-model="nouveauType.color" title="Couleur" />
          <button @click="creerType">Créer</button>
        </div>
      </details>
    </div>

    <div class="tracker-box" :class="{ active: enCours }">

      <div v-if="!enCours" class="form-start">
        <div class="row">
          <select v-model="form.project_id">
            <option value="" disabled>Choisir un Projet...</option>
            <option v-for="p in projets" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>

          <select v-model="form.activity_id">
            <option value="" disabled>Type d'activité...</option>
            <option v-for="t in typesActivites" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <input v-model="form.comment" placeholder="Description (optionnel)" class="input-comment" />
        <button @click="demarrer" class="btn-start">▶ DÉMARRER</button>
      </div>

      <div v-else class="timer-display">
        <div class="current-info">
          <span class="badge" :style="{ background: getType(enCours.activity_id).color }">
            {{ getType(enCours.activity_id).name }}
          </span>
          <strong>{{ getProjName(enCours.project_id) }}</strong>
        </div>
        <div class="digits">{{ timerDisplay }}</div>
        <button @click="stopper" class="btn-stop">■ STOP</button>
      </div>
    </div>

    <div class="history">
      <h3>Historique du jour</h3>
      <div v-if="historique.length === 0" class="empty">Aucune activité terminée aujourd'hui.</div>
      <ul v-else>
        <li v-for="h in historique" :key="h.id" class="hist-item"
          :style="{ borderLeftColor: getType(h.activity_id).color }">
          <div>
            <strong>{{ getProjName(h.project_id) }}</strong>
            <small> • {{ getType(h.activity_id).name }}</small>
            <div class="comment" v-if="h.comment">{{ h.comment }}</div>
          </div>
          <div class="time-range">
            {{ new Date(h.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }} -
            {{ new Date(h.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 600px;
  margin: 0 auto;
}

.quick-add-type {
  margin-bottom: 20px;
  font-size: 0.9em;
}

.add-box {
  display: flex;
  gap: 5px;
  margin-top: 5px;
  padding: 10px;
  background: #eee;
  border-radius: 4px;
}

.add-box input[type="text"] {
  flex: 1;
  padding: 5px;
}

.tracker-box {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  border: 1px solid #ddd;
}

.tracker-box.active {
  border-color: #42b983;
  background: #f0fdf4;
}

.row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

select {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.input-comment {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.btn-start {
  width: 100%;
  padding: 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1em;
  cursor: pointer;
}

.btn-stop {
  background: #d9534f;
  color: white;
  padding: 10px 30px;
  border: none;
  border-radius: 20px;
  font-size: 1.2em;
  cursor: pointer;
}

.timer-display {
  text-align: center;
}

.digits {
  font-size: 3em;
  font-family: monospace;
  font-weight: bold;
  margin: 15px 0;
  color: #333;
}

.badge {
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8em;
  margin-right: 5px;
  vertical-align: middle;
}

.hist-item {
  background: white;
  border-bottom: 1px solid #eee;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  border-left: 4px solid #ccc;
  margin-bottom: 5px;
}

.time-range {
  font-weight: bold;
  font-size: 0.9em;
  color: #555;
}

.empty {
  color: #777;
  font-style: italic;
}
</style>