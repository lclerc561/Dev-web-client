import { createRouter, createWebHistory } from 'vue-router'
import Profil from '../views/Profil.vue'
import Projet from '../views/Projet.vue'
import Activite from '../views/Activite.vue'
import Connexion from '../views/Connexion.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/profil',
      name: 'profil',
      component: Profil,
    },
    {
      path: '/projet',
      name: 'projet',
      component: Projet,
    },
    {
      path: '/activite',
      name: 'activite',
      component: Activite,
    },
    {
      path: '/connexion',
      name: 'connexion',
      component: Connexion,
    },
  ],
})

export default router
