<script setup>
import { ref } from 'vue'
import { key, nom, mail, saveKey, clearKey } from '../components/Connexion.js'

// Nouvelle ref pour l'utilisateur qui saisit sa clé manuellement
const cle = ref('')

// Détecte si l'utilisateur est déjà connecté
const apiKeyExist = ref(!!key.value)

// Valider la création de compte local
function valider() {
  if (!nom.value || !mail.value) {
    alert('Veuillez remplir tous les champs')
    return
  }

  // Générer une clé simulée pour le compte local
  const nouvelleKey = 'API_' + Math.random().toString(36).substring(2)
  saveKey(nouvelleKey)

  apiKeyExist.value = true
  alert(`Compte créé ! Votre clé est : ${nouvelleKey}`)
}

// Valider la saisie d'une clé Timely
function validerK() {
  if (!cle.value) {
    alert('Veuillez entrer votre clé Timely')
    return
  }

  saveKey(cle.value)
  apiKeyExist.value = true
  alert('Connexion réussie avec votre clé Timely.')
}

// Déconnexion
function deconnecter() {
  clearKey()
  apiKeyExist.value = false
  alert('Vous êtes déconnecté.')
}
</script>

<template>
    <h2>Connexion</h2>
    <div v-if="!apiKeyExist">
        <div>
            <input type="text" v-model="nom" placeholder="entrer votre nom">
            <input type="text" v-model="mail" placeholder="entrer votre email">
            <button @click="valider">Valider</button>
        </div>
        <h4> ou </h4>
        <div>
            <input type="text" v-model="key" placeholder="entrer votre clé">
            <button @click="validerK">Valider</button>
        </div>
    </div>

    <div v-else>
        <h4>{{ nom }}, {{ mail }}, {{ key }}</h4>
        <p>Vous êtes déjà connecté avec votre API Key.</p>
        <button @click="deconnecter">Se déconnecter</button>
    </div>
</template>

<style scoped>

div {
    display: flex;
    flex-direction: column;
    padding-right: 60%;
}

button {
    background-color: green;
    color: white;
}
</style>
