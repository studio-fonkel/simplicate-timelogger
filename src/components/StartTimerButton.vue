<template>
  <button
    type="button"
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

<style scoped lang="scss">
  button {
    color: white;
    font-weight: 700;

    &:not(:disabled) {
      background-color: #26c018;
      background: linear-gradient(to bottom, #26c018, #23a817);
      box-shadow: 0 5px 15px -3px rgba(#0a2507, 0.2);
      cursor: pointer;
      transition: background 0.1s ease-out;

      &:hover,
      &:focus {
        background: linear-gradient(to bottom, #20ac13, #1f9913);
      }

      &:active {
        background: linear-gradient(to bottom, #1b8a11, #1b7e12);
      }
    }

    &:disabled {
      background: linear-gradient(to bottom, #bbbbbb, #b3b3b3);
      box-shadow: 0 5px 15px -3px rgba(#585858, 0.2);
    }
  }
</style>
