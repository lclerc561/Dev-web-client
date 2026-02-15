<script setup>
import { ref, onMounted } from 'vue'
import axios from '../plugins/axios'

const activites = ref([])
const loading = ref(false)
const form = ref({ name: '', color: '#42b983' })

async function chargerActivites() {
    loading.value = true
    try {
        const response = await axios.get('/activities')
        activites.value = response.data
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

async function creerActivite() {
    if (!form.value.name) return alert('Nom obligatoire')
    try {
        await axios.post('/activities', form.value)
        form.value.name = ''
        await chargerActivites()
    } catch (e) { alert("Erreur création") }
}

async function supprimer(id) {
    if (confirm("Supprimer ce type d'activité ?")) {
        try {
            await axios.patch(`/activities/${id}/disable`)
            await chargerActivites()
        } catch (e) { alert("Erreur suppression") }
    }
}

onMounted(chargerActivites)
</script>

<template>
    <div class="config-page">
        <h2>Gérer les types d'activités</h2>

        <div class="add-box">
            <div class="input-group">
                <input v-model="form.name" placeholder="Nom (ex: Dév, Réunion...)" />
                <input type="color" v-model="form.color" class="color-picker" title="Choisir une couleur" />
            </div>
            <button @click="creerActivite">Ajouter</button>
        </div>

        <hr>

        <div v-if="loading">Chargement...</div>

        <ul v-else class="list">
            <li v-for="act in activites" :key="act.id" class="item" :style="{ borderLeftColor: act.color }">
                <div class="info">
                    <span class="dot" :style="{ background: act.color }"></span>
                    <strong>{{ act.name }}</strong>
                </div>
                <button @click="supprimer(act.id)" class="btn-del">Supprimer</button>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.config-page {
    max-width: 600px;
    margin: 0 auto;
}

.add-box {
    background: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
}

.input-group {
    display: flex;
    gap: 10px;
    flex: 1;
    align-items: center;
}

input[type="text"] {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.color-picker {
    height: 38px;
    width: 50px;
    border: none;
    cursor: pointer;
    background: none;
}

.list {
    list-style: none;
    padding: 0;
    margin-top: 20px;
}

.item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 1px solid #eee;
    background: white;
    border-left: 5px solid transparent;
    /* La bordure colorée */
    margin-bottom: 5px;
}

.info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
}

.btn-del {
    background: #ff4d4f;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8em;
}
</style>