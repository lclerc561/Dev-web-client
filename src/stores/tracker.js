import { defineStore } from 'pinia'
import axios from '@/plugins/axios'

export const useTrackerStore = defineStore('tracker', {
    state: () => ({
        enCours: null,
        totalHeuresJour: '00:00',
        objectifs: { faits: 0, total: 0 }
    }),

    actions: {
        async refreshHeaderData() {
            try {
                const resTime = await axios.get('/time-entries')
                const entries = resTime.data

                this.enCours = entries.find(e => !e.end) || null

                let totalMs = entries
                    .filter(e => e.end)
                    .reduce((acc, e) => acc + (new Date(e.end) - new Date(e.start)), 0)

                const h = Math.floor(totalMs / 3600000).toString().padStart(2, '0')
                const m = Math.floor((totalMs % 3600000) / 60000).toString().padStart(2, '0')
                this.totalHeuresJour = `${h}h${m}`

                this.objectifs = { faits: 0, total: 0 }

            } catch (e) {
                console.error("Erreur sync tracker", e)
            }
        },

        async stopperActivite() {
            if (!this.enCours) return
            try {
                await axios.patch(`/time-entries/${this.enCours.id}/stop`)
                this.enCours = null
                await this.refreshHeaderData()
            } catch (e) {
                console.error(e)
            }
        }
    }
})