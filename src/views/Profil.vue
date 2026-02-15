<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

const authStore = useAuthStore()
const copied = ref(false)
const loading = ref(false)
const showKey = ref(false)

const form = ref({
  name: '',
  email: ''
})

async function chargerProfil() {
  try {
    const response = await axios.get('/profile')
    form.value.name = response.data.name
    form.value.email = response.data.email
    authStore.user = response.data
  } catch (error) {
    console.error('Erreur chargement profil', error)
  }
}

async function mettreAJour() {
  loading.value = true
  try {
    await axios.put('/profile', form.value)
    authStore.user = { ...form.value }
    alert('Profil modifié avec succès !')
  } catch (error) {
    alert('Erreur lors de la sauvegarde')
  } finally {
    loading.value = false
  }
}

function copierCle() {
  navigator.clipboard.writeText(authStore.apiKey)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

onMounted(() => {
  if (authStore.user) {
    form.value.name = authStore.user.name
    form.value.email = authStore.user.email
  }
  chargerProfil()
})
</script>

<template>
  <div class="profil-page">
    <h2>Mon Profil</h2>

    <div class="card">
      <h3>Mes informations</h3>
      <div class="form-group">
        <label>Nom complet</label>
        <input v-model="form.name" type="text" />
      </div>

      <div class="form-group">
        <label>Adresse Email</label>
        <input v-model="form.email" type="email" />
      </div>

      <button @click="mettreAJour" :disabled="loading" class="btn-save">
        {{ loading ? 'Sauvegarde...' : 'Enregistrer les modifications' }}
      </button>
    </div>

    <div class="card key-card">
      <h3>Ma Clé API</h3>
      <p class="desc">
        Utile pour se reconnecter ailleurs. Gardez-la secrète.
      </p>
      
      <div class="key-display">
        <code :class="{ blurred: !showKey }">
          {{ showKey ? authStore.apiKey : '••••••••••••••••••••••••••••••••' }}
        </code>
        
        <div class="actions">
            <button @click="showKey = !showKey" class="btn-toggle">
                {{ showKey ? 'Masquer' : 'Afficher' }}
            </button>
            
            <button @click="copierCle" class="btn-copy">
                {{ copied ? 'Copié !' : 'Copier' }}
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profil-page { max-width: 600px; margin: 0 auto; }
.card { 
  background: white; 
  padding: 20px; 
  border-radius: 8px; 
  border: 1px solid #ddd; 
  margin-bottom: 20px; 
}
.key-card { border-color: #42b983; background-color: #f9fffb; }

.form-group { margin-bottom: 15px; }
label { display: block; font-weight: bold; margin-bottom: 5px; }
input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }

.btn-save { 
  background-color: #2c3e50; 
  color: white; 
  border: none; 
  padding: 10px 15px; 
  border-radius: 4px; 
  cursor: pointer; 
}

.key-display { 
  display: flex; 
  justify-content: space-between;
  align-items: center;
  background: #eee; 
  padding: 10px; 
  border-radius: 4px; 
}

code { 
    font-family: monospace; 
    font-size: 1.1em;
    color: #333;
}
code.blurred { color: #888; letter-spacing: 2px; }

.actions { display: flex; gap: 5px; }

button { border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
.btn-toggle { background: #ddd; color: #333; }
.btn-copy { background: #42b983; color: white; }
.desc { font-size: 0.9em; color: #666; margin-bottom: 10px; }
</style>