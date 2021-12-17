<template>
  <button
    type="button"
    class="btn--green"
    :disabled="timerButtonEnabled === false"
    @click="doCreateTimer"
  >
    Start timer
  </button>
</template>

<script setup>
  import { computed } from 'vue';

  import { RESULT_CODES } from '../composables/use-misc.js';
  import { createTimer, creatingTimer } from '../composables/use-timer.js';
  import { currentProject, loadingAvailableProjects } from '../composables/use-projects.js';
  import { currentProjectService, loadingAvailableProjectServices } from '../composables/use-project-services.js';
  import { currentProjectServiceHoursType, loadingAvailableProjectServiceHoursTypes } from '../composables/use-project-service-hours-types.js';
  import { fixTime } from '../composables/use-date-helper.js';

  const props = defineProps({
    startTime: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  });

  const emit = defineEmits({
    'timer-created': null,
  });

  async function doCreateTimer () {
    creatingTimer.value = true;

    const res = await createTimer({
      projectId: currentProject.value.id,
      projectServiceId: currentProjectService.value.id,
      projectServiceHoursTypeId: currentProjectServiceHoursType.value.id,
      startTime: fixTime(props.startTime),
      description: props.description,
    });

    if (res === RESULT_CODES.success) {
      emit('timer-created');
    }
    else {
      alertError();
    }

    creatingTimer.value = false;
  }

  function alertError () {
    alert('Er gaat iets mis. Je kunt de error in de browser console terugvinden.');
  }

  const timerButtonEnabled = computed(() => {
    return (
      creatingTimer.value !== true
      && currentProject.value !== null
      && currentProjectService.value !== null
      && currentProjectServiceHoursType.value !== null
      && loadingAvailableProjects.value !== true
      && loadingAvailableProjectServices.value !== true
      && loadingAvailableProjectServiceHoursTypes.value !== true
    );
  });
</script>
