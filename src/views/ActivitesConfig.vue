<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from '@/plugins/axios'

const activites = ref([])
const loading = ref(false)
const form = ref({ name: '', color: '#42b983' })

const recherche = ref('')
const afficherDesactives = ref(false)
const editingId = ref(null)
const editForm = ref({ name: '', color: '' })

const estInactif = (item) => item.is_enabled === 0 || item.is_enabled === false

async function chargerActivites() {
    loading.value = true
    try {
        const endpoint = recherche.value ? `/activities?keywords=${recherche.value}` : '/activities'
        const response = await axios.get(endpoint)
        let data = response.data
        if (!afficherDesactives.value) {
            data = data.filter(a => !estInactif(a))
        }

        activites.value = data
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

let timeout
watch(recherche, () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => chargerActivites(), 500)
})

async function creerActivite() {
    if (!form.value.name) return alert('Nom obligatoire')
    try {
        await axios.post('/activities', form.value)
        form.value.name = ''
        await chargerActivites()
    } catch (e) { alert("Erreur création") }
}

async function supprimer(id) {
    if (confirm("Désactiver ce type d'activité ?")) {
        try {
            await axios.patch(`/activities/${id}/disable`, {})
            await chargerActivites()
        } catch (e) { alert("Erreur suppression") }
    }
}

async function reactiver(id) {
    if (confirm("Réactiver ce type d'activité ?")) {
        try {
            await axios.patch(`/activities/${id}/enable`, {})
            await chargerActivites()
        } catch (e) { alert("Erreur réactivation") }
    }
}

function activerEdition(act) {
    editingId.value = act.id
    editForm.value = { name: act.name, color: act.color }
}

function annulerEdition() {
    editingId.value = null
}

async function sauvegarderModification(id) {
    if (!editForm.value.name) return alert('Nom obligatoire')
    try {
        await axios.put(`/activities/${id}`, editForm.value)
        editingId.value = null
        await chargerActivites()
    } catch (e) {
        alert("Erreur lors de la modification")
    }
}

onMounted(chargerActivites)
</script>

<template>
    <div class="dashboard">
        <h2>Types d'Activités</h2>

        <div class="config-section">
            <h3>Nouvelle Activité</h3>
            <div class="add-row">
                <input v-model="form.name" placeholder="Nom (ex: Dév, Réunion...)" class="input-base" />
                <input type="color" v-model="form.color" class="color-picker" title="Choisir une couleur" />
                <button @click="creerActivite" class="btn-add">Ajouter</button>
            </div>
        </div>

        <div class="search-section">
            <input v-model="recherche" type="search" placeholder="🔍 Rechercher une activité par mot-clé..." class="input-base" />
            
            <label class="toggle-inactifs">
                <input type="checkbox" v-model="afficherDesactives" @change="chargerActivites" />
                Afficher les activités désactivées
            </label>
        </div>

        <div class="list-container">
            <p v-if="loading" class="empty">Chargement...</p>
            <div v-else-if="activites.length === 0" class="empty">Aucune activité trouvée.</div>

            <TransitionGroup v-else name="list" tag="ul" class="item-list">
                <li v-for="act in activites" :key="act.id" class="list-item" :class="{ 'is-inactive': estInactif(act) }" :style="{ borderLeftColor: act.color }">
                    
                    <div v-if="editingId !== act.id" class="item-content">
                        <div class="item-info">
                            <span class="dot" :style="{ background: act.color }"></span>
                            <strong>{{ act.name }} <span v-if="estInactif(act)" class="badge-inactif">(Désactivé)</span></strong>
                        </div>
                        <div class="actions">
                            <button class="btn-action edit" @click="activerEdition(act)">Modifier</button>
                            
                            <button v-if="estInactif(act)" class="btn-action enable" @click="reactiver(act.id)">Réactiver</button>
                            <button v-else class="btn-action delete" @click="supprimer(act.id)">Désactiver</button>
                        </div>
                    </div>

                    <div v-else class="item-edit-mode">
                        <div class="edit-inputs">
                            <input v-model="editForm.name" placeholder="Nom" class="input-base" />
                            <input type="color" v-model="editForm.color" class="color-picker" />
                        </div>
                        <div class="actions">
                            <button class="btn-action save" @click="sauvegarderModification(act.id)">Enregistrer</button>
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
.add-row { display: flex; gap: 10px; align-items: center; }
.edit-inputs { display: flex; gap: 10px; flex: 1; align-items: center; }
.input-base { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.color-picker { height: 35px; width: 45px; border: none; cursor: pointer; background: none; padding: 0; }
.btn-add { background: #2c3e50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.toggle-inactifs { display: block; margin-top: 15px; font-size: 0.9em; color: #555; cursor: pointer; }
.item-list { list-style: none; padding: 0; }
.list-item { background: white; padding: 12px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #eee; border-left: 5px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: 0.3s; }
.list-item.is-inactive { opacity: 0.6; background-color: #fafafa; }
.badge-inactif { font-size: 0.8em; color: #ff9f43; font-weight: normal; margin-left: 5px; }
.item-content, .item-edit-mode { display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 15px;}
.item-info { display: flex; align-items: center; gap: 10px; }
.dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
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