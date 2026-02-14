<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <h1>Bienvenue sur l'application timely</h1>
    <div class="wrapper">

      <nav>
        <RouterLink to="/profil">Mon profil</RouterLink>
        <RouterLink to="/projet">Mes projets</RouterLink>
        <RouterLink to="/activite">Mes activités</RouterLink>
        <RouterLink to="/connexion">Se connecter</RouterLink>
      </nav>
    </div>
  </header>

  <div id="affichage">
    <RouterView />
  </div>
</template>
