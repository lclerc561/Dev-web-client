import { ref } from 'vue'

// API key ou token stocké par l'utilisateur
export const key = ref(localStorage.getItem('TIMELY_TOKEN') || '')

// Nom et mail (si utile)
export const nom = ref('')
export const mail = ref('')

export function saveKey(k) {
  key.value = k
  localStorage.setItem('TIMELY_TOKEN', k)
}

export function clearKey() {
  key.value = ''
  localStorage.removeItem('TIMELY_TOKEN')
}
