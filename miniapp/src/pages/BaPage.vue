<template>
  <BasePage 
    title="Business Analysis"
    subtitle="Дізнайтеся про професію Business Analyst"
    :showBackArrow="true"
  >
    <ProfessionPage profession="ba"/>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from '../components/BasePage.vue'
import ProfessionPage from '../components/ProfessionPage.vue'
</script>