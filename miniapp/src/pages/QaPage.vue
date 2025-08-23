<template>
  <BasePage 
    title="Quality Assurance"
    subtitle="Дізнайтеся про професію QA Engineer"
    :showBackArrow="true"
  >
    <ProfessionPage profession="qa"/>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from '../components/BasePage.vue'
import ProfessionPage from '../components/ProfessionPage.vue'
</script>