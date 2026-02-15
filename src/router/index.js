import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // On importe le store pour vérifier la clé

// Importation simple de vos vues
import Connexion from '../views/Connexion.vue'
import Activite from '../views/Activite.vue'
import Profil from '../views/Profil.vue'
import Projet from '../views/Projet.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/activite'
    },
    {
      path: '/connexion',
      name: 'connexion',
      component: Connexion
    },
    {
      path: '/activite',
      name: 'activite',
      component: Activite
    },
    {
      path: '/profil',
      name: 'profil',
      component: Profil
    },
    {
      path: '/projets',
      name: 'projet',
      component: Projet
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.name !== 'connexion' && !authStore.apiKey) {
    next('/connexion')
  } else {
    next()
  }
})

export default router