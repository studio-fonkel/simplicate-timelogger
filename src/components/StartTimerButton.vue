<template>
  <button
    type="button"
    class="btn--green"
    :disabled="timerButtonEnabled === false"
  >
    Start timer
  </button>
</template>

<script setup>
  import { computed } from 'vue';
  import { currentProjectServiceHoursType, loadingAvailableProjectServiceHoursTypes } from '../composables/use-project-service-hours-types.js';
  import { currentProjectService, loadingAvailableProjectServices } from '../composables/use-project-services.js';
  import { currentProject, loadingAvailableProjects } from '../composables/use-projects.js';

  const timerButtonEnabled = computed(() => {
    return (
      currentProject.value !== null
      && currentProjectService.value !== null
      && currentProjectServiceHoursType.value !== null
      && loadingAvailableProjects.value !== true
      && loadingAvailableProjectServices.value !== true
      && loadingAvailableProjectServiceHoursTypes.value !== true
    );
  });
</script>
