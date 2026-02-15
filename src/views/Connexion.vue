<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  nom: '',
  email: '',
  key: ''
})

const nouvelleCle = ref(null)

async function creerCompte() {
  if (!form.value.nom || !form.value.email) return alert('Champs manquants')

  try {
    await authStore.loginOrRegister(form.value.nom, form.value.email)
    nouvelleCle.value = authStore.apiKey
  } catch (e) {
    alert('Erreur lors de la création (vérifiez la console)')
  }
}

function continuer() {
  router.push('/activite')
}

function connexionManuelle() {
  if (!form.value.key) return alert('Clé manquante')
  authStore.setApiKey(form.value.key)
  router.push('/activite')
}

function deconnexion() {
  authStore.logout()
  nouvelleCle.value = null
}
</script>

<template>
  <div class="login-container">
    <h2>Connexion Timely</h2>

    <div v-if="nouvelleCle" class="success-box">
      <h3>🎉 Compte créé avec succès !</h3>
      <p><strong>ATTENTION :</strong> Copiez cette clé et gardez-la précieusement. C'est votre seul moyen de vous
        reconnecter sur un autre appareil.</p>

      <div class="key-display">
        {{ nouvelleCle }}
      </div>

      <button @click="continuer" class="btn-go">C'est noté, accéder à l'application</button>
    </div>

    <div v-else-if="!authStore.apiKey">

      <div class="box">
        <h3>Nouveau ? Créez un compte</h3>
        <input v-model="form.nom" placeholder="Nom complet" />
        <input v-model="form.email" placeholder="Email" />
        <button @click="creerCompte">Obtenir ma clé</button>
      </div>

      <div class="divider">OU</div>

      <div class="box">
        <h3>J'ai déjà une clé</h3>
        <input v-model="form.key" placeholder="Collez votre API Key ici" />
        <button @click="connexionManuelle">Entrer</button>
      </div>
    </div>

    <div v-else>
      <p>Connecté en tant que : <strong>{{ authStore.user?.name || 'Utilisateur' }}</strong></p>
      <button @click="router.push('/activite')">Aller aux activités</button>
      <br><br>
      <button @click="deconnexion" class="logout">Se déconnecter</button>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  font-family: sans-serif;
}

.box {
  border: 1px solid #ddd;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  background: #fff;
}

.divider {
  font-weight: bold;
  color: #888;
  margin: 15px 0;
}

input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  box-sizing: border-box;
}

button {
  padding: 10px 20px;
  cursor: pointer;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
}

button:hover {
  background-color: #3aa876;
}

.logout {
  background: #d9534f;
  margin-top: 10px;
}

.success-box {
  background-color: #e8f5e9;
  border: 2px solid #42b983;
  padding: 20px;
  border-radius: 8px;
}

.key-display {
  background: #333;
  color: #fff;
  padding: 15px;
  margin: 15px 0;
  font-family: monospace;
  font-size: 1.2em;
  word-break: break-all;
  border-radius: 4px;
  user-select: all;
}

.btn-go {
  background: #2c3e50;
  width: 100%;
}
</style>