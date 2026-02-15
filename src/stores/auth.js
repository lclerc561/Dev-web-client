import { defineStore } from 'pinia'
import axios from '../plugins/axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        apiKey: '',
        user: null
    }),

    // ACTIONS : Les méthodes pour modifier le state
    actions: {
        setApiKey(key) {
            this.apiKey = key
        },
        
        async loginOrRegister(name, email) {
            try {
                const response = await axios.post('/apikeys', { name, email })
                this.apiKey = response.data.key
                this.user = { name, email }
                return true
            } catch (error) {
                console.error("Erreur auth", error)
                throw error
            }
        },

        logout() {
            this.apiKey = ''
            this.user = null
        }
    },

    persist: {
        enabled: true,
        strategies: [
            { storage: localStorage, paths: ['apiKey', 'user'] }
        ]
    }
})