<script setup>
import { ref, onMounted } from 'vue'
import axios from '../plugins/axios'

const projets = ref([])
const nouveauProjet = ref({ name: '', description: '' })
const loading = ref(false)

async function chargerProjets() {
  loading.value = true
  try {
    const response = await axios.get('/projects')
    projets.value = response.data
  } catch (error) {
    console.error('Erreur chargement projets', error)
    alert('Impossible de charger les projets')
  } finally {
    loading.value = false
  }
}

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
    if(!confirm("Voulez-vous désactiver ce projet ?")) return

    try {
        await axios.patch(`/projects/${id}/disable`)
        await chargerProjets()
    } catch (e) {
        alert("Erreur suppression")
    }
}

onMounted(() => {
  chargerProjets()
})
</script>

<template>
  <div class="page-projet">
    <h2>Gestion des Projets</h2>

    <div class="add-section">
      <h3>Nouveau Projet</h3>
      <div class="form-group">
        <input v-model="nouveauProjet.name" placeholder="Nom du projet (ex: Site Web Client)" />
        <input v-model="nouveauProjet.description" placeholder="Description courte" />
        <button @click="creerProjet">Ajouter</button>
      </div>
    </div>

    <hr>

    <h3>Mes Projets existants</h3>
    
    <p v-if="loading">Chargement...</p>
    
    <div v-else-if="projets.length === 0">Aucun projet pour le moment.</div>
    
    <ul v-else class="project-list">
      <li v-for="projet in projets" :key="projet.id" class="project-item">
        <div class="project-info">
            <strong>{{ projet.name }}</strong>
            <span v-if="projet.description"> - {{ projet.description }}</span>
        </div>
        <button class="btn-delete" @click="supprimerProjet(projet.id)">Supprimer</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.add-section { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;}
.form-group { display: flex; gap: 10px; }
input { padding: 8px; flex: 1; }
.project-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
.btn-delete { background: #ff4d4f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
</style>