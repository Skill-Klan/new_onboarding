<template>
  <BasePage 
    title="Backend Development"
    subtitle="Дізнайтеся про професію Backend Developer"
    :showBackArrow="true"
  >
    <ProfessionPage profession="be"/>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from '../components/BasePage.vue'
import ProfessionPage from '../components/ProfessionPage.vue'
</script>