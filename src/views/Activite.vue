<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from '@/plugins/axios'

const projets = ref([])
const typesActivites = ref([])
const historique = ref([])
const enCours = ref(null)
const timerDisplay = ref('00:00:00')
const objectifs = ref([])
const nouvelObjectif = ref({ name: '', content: '' })
const form = ref({ project_id: '', activity_id: '', comment: '' })
const manualForm = ref({ project_id: '', activity_id: '', comment: '', start: '', end: '' })
const editingHistoryId = ref(null)
const editHistoryForm = ref({ project_id: '', activity_id: '', comment: '', start: '', end: '' })
let intervalId = null

async function chargerObjectifs() {
  try {
    const aujourdhui = new Date().toISOString().split('T')[0]
    const res = await axios.get(`/daily-objectives?date=${aujourdhui}`)
    objectifs.value = res.data
  } catch (e) {
    console.error(e)
  }
}

async function ajouterObjectif() {
  if (!nouvelObjectif.value.name) return
  try {
    await axios.post('/daily-objectives', nouvelObjectif.value)
    nouvelObjectif.value = { name: '', content: '' }
    await chargerObjectifs()
  } catch (e) {
    alert("Erreur lors de la création de l'objectif")
  }
}

async function cocherObjectif(id, estFait) {
  try {
    const route = estFait ? 'done' : 'undone'
    await axios.patch(`/daily-objectives/${id}/${route}`)
    await chargerObjectifs()
  } catch (e) {
    alert("Erreur de mise à jour")
  }
}

async function init() {
  try {
    const [resProj, resTypes, resTime] = await Promise.all([
      axios.get('/projects'),
      axios.get('/activities'),
      axios.get('/time-entries')
    ])

    projets.value = resProj.data.filter(p => p.active !== false && p.active !== 0)
    typesActivites.value = resTypes.data.filter(t => t.active !== false && t.active !== 0)

    const current = resTime.data.find(e => !e.end)
    if (current) {
      enCours.value = current
      demarrerCompteurVisuel(current.start)
    }

    historique.value = resTime.data.filter(e => e.end).reverse()
    await chargerObjectifs()
  } catch (e) {
    console.error(e)
  }
}

async function demarrer() {
  if (!form.value.project_id || !form.value.activity_id) return

  const payload = {
    project_id: form.value.project_id,
    activity_id: form.value.activity_id,
    comment: form.value.comment || null
  }

  try {
    const res = await axios.post('/time-entries', payload)
    enCours.value = res.data
    demarrerCompteurVisuel(enCours.value.start)
    form.value.comment = ''
    await init()
  } catch (e) {
    alert("Erreur lors du démarrage")
  }
}

async function stopper() {
  if (!enCours.value) return
  try {
    await axios.patch(`/time-entries/${enCours.value.id}/stop`)
    clearInterval(intervalId)
    enCours.value = null
    timerDisplay.value = '00:00:00'
    await init()
  } catch (e) {
    alert("Erreur arrêt")
  }
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

async function ajouterManuel() {
  if (!manualForm.value.project_id || !manualForm.value.activity_id || !manualForm.value.start || !manualForm.value.end) return
  try {
    await axios.post('/time-entries', {
      project_id: manualForm.value.project_id,
      activity_id: manualForm.value.activity_id,
      comment: manualForm.value.comment,
      start: new Date(manualForm.value.start).toISOString(),
      end: new Date(manualForm.value.end).toISOString()
    })
    manualForm.value = { project_id: '', activity_id: '', comment: '', start: '', end: '' }
    await init()
  } catch (e) {
    alert("Erreur d'ajout manuel")
  }
}

async function supprimerEntree(id) {
  if (!confirm("Supprimer cette entrée ?")) return
  try {
    await axios.delete(`/time-entries/${id}`)
    await init()
  } catch (e) {
    alert("Erreur suppression")
  }
}

function activerEditionEntree(h) {
  editingHistoryId.value = h.id
  editHistoryForm.value = {
    project_id: h.project_id,
    activity_id: h.activity_id,
    comment: h.comment,
    start: h.start.slice(0, 16),
    end: h.end.slice(0, 16)
  }
}

async function sauvegarderEntree(id) {
  try {
    await axios.put(`/time-entries/${id}`, {
      project_id: editHistoryForm.value.project_id,
      activity_id: editHistoryForm.value.activity_id,
      comment: editHistoryForm.value.comment,
      start: new Date(editHistoryForm.value.start).toISOString(),
      end: new Date(editHistoryForm.value.end).toISOString()
    })
    editingHistoryId.value = null
    await init()
  } catch (e) {
    alert("Erreur lors de la modification")
  }
}

const getProjName = (id) => projets.value.find(p => p.id === id)?.name || '?'
const getType = (id) => typesActivites.value.find(t => t.id === id) || { name: '?', color: '#ccc' }

onMounted(init)
onUnmounted(() => clearInterval(intervalId))
</script>

<template>
  <div class="dashboard">
    <h2>Page d'activité</h2>

    <div class="tracker-box" :class="{ active: enCours }">
      <div v-if="!enCours" class="form-start">
        <h3>Nouvelle activité</h3>
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
        <input v-model="form.comment" placeholder="Note ou commentaire (Markdown possible)" class="input-comment" />
        <button @click="demarrer" class="btn-start">DÉMARRER</button>
      </div>

      <div v-else class="timer-display">
        <div class="current-info">
          <span class="badge" :style="{ background: getType(enCours.activity_id).color }">
            {{ getType(enCours.activity_id).name }}
          </span>
          <strong>{{ getProjName(enCours.project_id) }}</strong>
        </div>
        <div class="digits">{{ timerDisplay }}</div>
        <button @click="stopper" class="btn-stop">STOPPER</button>
      </div>
    </div>

    <div class="manual-add-section">
      <details>
        <summary>Ajouter une entrée passée manuellement</summary>
        <div class="manual-form">
          <div class="row">
            <select v-model="manualForm.project_id" class="input-base">
              <option value="" disabled>Projet...</option>
              <option v-for="p in projets" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
            <select v-model="manualForm.activity_id" class="input-base">
              <option value="" disabled>Activité...</option>
              <option v-for="t in typesActivites" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="row">
            <input type="datetime-local" v-model="manualForm.start" class="input-base" />
            <input type="datetime-local" v-model="manualForm.end" class="input-base" />
          </div>
          <input v-model="manualForm.comment" placeholder="Commentaire" class="input-base"
            style="margin-bottom: 10px;" />
          <button @click="ajouterManuel" class="btn-add-obj">Enregistrer</button>
        </div>
      </details>
    </div>

    <div class="objectives-section">
      <h3>Mes objectifs du jour</h3>

      <div class="add-objective">
        <input v-model="nouvelObjectif.name" placeholder="Titre de l'objectif..." />
        <textarea v-model="nouvelObjectif.content" placeholder="Description détaillée..."></textarea>
        <button @click="ajouterObjectif" class="btn-add-obj">Ajouter</button>
      </div>

      <div class="objectives-list">
        <div v-if="objectifs.length === 0" class="empty">Aucun objectif aujourd'hui.</div>
        <div v-for="obj in objectifs" :key="obj.id" class="obj-item" :class="{ 'is-done': obj.done }">
          <input type="checkbox" :checked="obj.done" @change="cocherObjectif(obj.id, !obj.done)" />
          <div class="obj-text">
            <strong>{{ obj.name }}</strong>
            <p v-if="obj.content" class="obj-desc">{{ obj.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="history">
      <h3>Activités terminées aujourd'hui</h3>
      <ul v-if="historique.length > 0" style="padding: 0; list-style: none;">
        <li v-for="h in historique" :key="h.id" class="hist-item"
          :style="{ borderLeftColor: getType(h.activity_id).color }">

          <div v-if="editingHistoryId !== h.id" class="hist-content">
            <div>
              <strong>{{ getProjName(h.project_id) }}</strong>
              <small> • {{ getType(h.activity_id).name }}</small>
              <div class="comment" v-if="h.comment">{{ h.comment }}</div>
            </div>
            <div class="right-col">
              <div class="time-range">
                <span v-format-date:time="h.start"></span> - <span v-format-date:time="h.end"></span>
              </div>
              <div class="actions">
                <button @click="activerEditionEntree(h)" class="btn-action edit">Modifier</button>
                <button @click="supprimerEntree(h.id)" class="btn-action delete">Supprimer</button>
              </div>
            </div>
          </div>

          <div v-else class="hist-edit">
            <div class="row">
              <select v-model="editHistoryForm.project_id" class="input-base">
                <option v-for="p in projets" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
              <select v-model="editHistoryForm.activity_id" class="input-base">
                <option v-for="t in typesActivites" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>
            <div class="row">
              <input type="datetime-local" v-model="editHistoryForm.start" class="input-base" />
              <input type="datetime-local" v-model="editHistoryForm.end" class="input-base" />
            </div>
            <input v-model="editHistoryForm.comment" class="input-base" style="margin-bottom: 10px;" />
            <div class="actions">
              <button @click="sauvegarderEntree(h.id)" class="btn-action save">Valider</button>
              <button @click="editingHistoryId = null" class="btn-action cancel">Annuler</button>
            </div>
          </div>

        </li>
      </ul>
      <div v-else class="empty">Rien à afficher pour le moment.</div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

.tracker-box {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #ddd;
  margin-bottom: 30px;
}

.tracker-box.active {
  border-color: #42b983;
  box-shadow: 0 0 15px rgba(66, 185, 131, 0.2);
}

.row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

select,
.input-comment,
.input-base {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
}

.btn-start {
  width: 100%;
  padding: 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.btn-stop {
  background: #d9534f;
  color: white;
  border: none;
  padding: 10px 40px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1.1em;
}

.digits {
  font-size: 3.5em;
  font-weight: bold;
  font-family: monospace;
  margin: 15px 0;
  color: #2c3e50;
  text-align: center;
}

.current-info {
  text-align: center;
}

.objectives-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.add-objective {
  margin-bottom: 20px;
}

.add-objective input,
.add-objective textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: block;
}

.btn-add-obj {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.obj-item {
  display: flex;
  gap: 12px;
  background: white;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #eee;
}

.obj-item.is-done {
  opacity: 0.6;
  text-decoration: line-through;
}

.obj-desc {
  font-size: 0.85em;
  color: #666;
  margin: 4px 0 0 0;
}

.hist-item {
  padding: 12px;
  background: white;
  margin-bottom: 8px;
  border-radius: 6px;
  border-left: 5px solid #ccc;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.hist-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.hist-edit {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.badge {
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75em;
  margin-right: 8px;
}

.empty {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.right-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.actions {
  display: flex;
  gap: 5px;
}

.btn-action {
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  color: white;
}

.btn-action.edit {
  background: #f39c12;
}

.btn-action.delete {
  background: #d9534f;
}

.btn-action.save {
  background: #42b983;
}

.btn-action.cancel {
  background: #7f8c8d;
}

.manual-add-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.manual-form {
  margin-top: 15px;
}

details {
  cursor: pointer;
}
</style>