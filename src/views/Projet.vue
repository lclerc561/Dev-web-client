<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from '@/plugins/axios'

const projets = ref([])
const nouveauProjet = ref({ name: '', description: '' })
const loading = ref(false)

const recherche = ref('')
const afficherDesactives = ref(false)
const editingId = ref(null)
const editForm = ref({ name: '', description: '' })

const estInactif = (item) => item.is_enabled === 0 || item.is_enabled === false

async function chargerProjets() {
  loading.value = true
  try {
    const endpoint = recherche.value ? `/projects?keywords=${recherche.value}` : '/projects'
    const response = await axios.get(endpoint)
    let data = response.data
    if (!afficherDesactives.value) {
        data = data.filter(p => !estInactif(p))
    }

    projets.value = data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

let timeout
watch(recherche, () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => chargerProjets(), 500)
})

async function creerProjet() {
  if (!nouveauProjet.value.name) return alert('Le nom est obligatoire')
  try {
    await axios.post('/projects', nouveauProjet.value)
    nouveauProjet.value = { name: '', description: '' }
    await chargerProjets()
  } catch (error) {
    alert("Erreur lors de la création")
  }
}

async function supprimerProjet(id) {
  if (!confirm("Voulez-vous désactiver ce projet ?")) return
  try {
    await axios.patch(`/projects/${id}/disable`, {})
    await chargerProjets()
  } catch (e) {
    alert("Erreur suppression")
  }
}

async function reactiverProjet(id) {
  if (!confirm("Voulez-vous réactiver ce projet ?")) return
  try {
    await axios.patch(`/projects/${id}/enable`, {})
    await chargerProjets()
  } catch (e) {
    alert("Erreur lors de la réactivation")
  }
}

function activerEdition(projet) {
  editingId.value = projet.id
  editForm.value = { name: projet.name, description: projet.description }
}

function annulerEdition() {
  editingId.value = null
}

async function sauvegarderModification(id) {
  if (!editForm.value.name) return alert('Nom obligatoire')
  try {
    await axios.put(`/projects/${id}`, editForm.value)
    editingId.value = null
    await chargerProjets()
  } catch (e) {
    alert("Erreur lors de la modification")
  }
}

onMounted(chargerProjets)
</script>

<template>
  <div class="dashboard">
    <h2>Mes Projets</h2>

    <div class="config-section">
      <h3>Nouveau Projet</h3>
      <div class="add-row">
        <input v-model="nouveauProjet.name" placeholder="Nom du projet (ex: Site Web Client)" class="input-base" />
        <input v-model="nouveauProjet.description" placeholder="Description courte" class="input-base" />
        <button @click="creerProjet" class="btn-add">Ajouter</button>
      </div>
    </div>

    <div class="search-section">
      <input v-model="recherche" type="search" placeholder="🔍 Rechercher un projet par mot-clé..." class="input-base" />
      
      <label class="toggle-inactifs">
          <input type="checkbox" v-model="afficherDesactives" @change="chargerProjets" />
          Afficher les projets désactivés
      </label>
    </div>

    <div class="list-container">
      <p v-if="loading" class="empty">Chargement...</p>
      <div v-else-if="projets.length === 0" class="empty">Aucun projet trouvé.</div>

      <TransitionGroup v-else name="list" tag="ul" class="item-list">
        <li v-for="projet in projets" :key="projet.id" class="list-item" :class="{ 'is-inactive': estInactif(projet) }">

          <div v-if="editingId !== projet.id" class="item-content">
            <div class="item-info">
              <strong>{{ projet.name }} <span v-if="estInactif(projet)" class="badge-inactif">(Désactivé)</span></strong>
              <p v-if="projet.description" class="item-desc">{{ projet.description }}</p>
            </div>
            <div class="actions">
              <button class="btn-action edit" @click="activerEdition(projet)">Modifier</button>
              
              <button v-if="estInactif(projet)" class="btn-action enable" @click="reactiverProjet(projet.id)">Réactiver</button>
              <button v-else class="btn-action delete" @click="supprimerProjet(projet.id)">Désactiver</button>
            </div>
          </div>

          <div v-else class="item-edit-mode">
            <div class="edit-inputs">
              <input v-model="editForm.name" placeholder="Nom" class="input-base" />
              <input v-model="editForm.description" placeholder="Description" class="input-base" />
            </div>
            <div class="actions">
              <button class="btn-action save" @click="sauvegarderModification(projet.id)">Enregistrer</button>
              <button class="btn-action cancel" @click="annulerEdition">Annuler</button>
            </div>
          </div>

        </li>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.dashboard { max-width: 700px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
.config-section, .search-section { background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
.config-section h3 { margin-top: 0; }
.add-row { display: flex; gap: 10px; }
.edit-inputs { display: flex; gap: 10px; flex: 1; }
.input-base { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.btn-add { background: #2c3e50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.toggle-inactifs { display: block; margin-top: 15px; font-size: 0.9em; color: #555; cursor: pointer; }
.item-list { list-style: none; padding: 0; }
.list-item { background: white; padding: 12px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #eee; border-left: 5px solid #ccc; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); transition: 0.3s;}
.list-item.is-inactive { opacity: 0.6; background-color: #fafafa; border-left-color: #ff9f43; }
.badge-inactif { font-size: 0.8em; color: #ff9f43; font-weight: normal; margin-left: 5px; }
.item-content, .item-edit-mode { display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 15px; }
.item-desc { font-size: 0.85em; color: #666; margin: 4px 0 0 0; }
.actions { display: flex; gap: 5px; }
.btn-action { border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85em; color: white; }
.btn-action.edit { background: #f39c12; }
.btn-action.delete { background: #d9534f; }
.btn-action.save { background: #42b983; }
.btn-action.cancel { background: #7f8c8d; }
.btn-action.enable { background: #3498db; }
.empty { color: #999; font-style: italic; text-align: center; padding: 20px; }
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(20px); }
</style>