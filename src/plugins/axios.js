import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const instance = axios.create({
  baseURL: 'https://timely.edu.netlor.fr/api'
})

instance.interceptors.request.use(config => {
  const authStore = useAuthStore()
  if (authStore.apiKey) {
    config.headers.Authorization = `key=${authStore.apiKey}`
  }
  return config
})

export default instance