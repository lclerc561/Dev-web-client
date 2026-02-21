import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const instance = axios.create({
  // URL de l'API définie dans la documentation [cite: 21]
  baseURL: 'https://timely.edu.netlor.fr/api'
})

// Intercepteur pour injecter la clé API dynamiquement au moment de la requête
instance.interceptors.request.use((config) => {
  // On récupère le store ICI, pas à la racine du fichier
  const authStore = useAuthStore()

  if (authStore.apiKey) {
    // Format imposé par le cahier des charges : key=[contenu de la clé]
    config.headers.Authorization = `key=${authStore.apiKey}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export default instance
