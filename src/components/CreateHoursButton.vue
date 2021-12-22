<template>
  <button
    type="button"
    class="btn--green"
    :disabled="createHoursButtonEnabled === false"
    @click="doCreateHours"
  >
    Opslaan
  </button>
</template>

<script setup>
  import { computed } from 'vue';

  import { RESULT_CODES } from '../composables/use-misc.js';
  import { createHours, creatingHours } from '../composables/use-hours.js';
  import { currentProject, loadingAvailableProjects } from '../composables/use-projects.js';
  import { currentProjectService, loadingAvailableProjectServices } from '../composables/use-project-services.js';
  import { currentProjectServiceHoursType, loadingAvailableProjectServiceHoursTypes } from '../composables/use-project-service-hours-types.js';
  import { fixTime } from '../composables/use-date-helper.js';

  const props = defineProps({
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  });

  const emit = defineEmits({
    'hours-created': null,
  });

  const doCreateHours = async () => {
    creatingHours.value = true;

    const res = await createHours({
      projectId: currentProject.value.id,
      projectServiceId: currentProjectService.value.id,
      projectServiceHoursTypeId: currentProjectServiceHoursType.value.id,
      startTime: fixTime(props.startTime),
      endTime: fixTime(props.endTime),
      description: props.description,
    });

    if (res === RESULT_CODES.success) {
      emit('hours-created');
    }
    else {
      alertError();
    }

    creatingHours.value = false;
  };

  function alertError () {
    alert('Er gaat iets mis. Je kunt de error in de browser console terugvinden.');
  }

  // REVIEW: Maybe it’s bad UX to disable this button when things are loading. It could cause clicks to be lost.
  const createHoursButtonEnabled = computed(() => {
    return (
      creatingHours.value !== true
      && currentProject.value !== null
      && currentProjectService.value !== null
      && currentProjectServiceHoursType.value !== null
      && loadingAvailableProjects.value !== true
      && loadingAvailableProjectServices.value !== true
      && loadingAvailableProjectServiceHoursTypes.value !== true
      && fixTime(props.startTime) !== null
      && fixTime(props.endTime) !== null
      && props.startTime !== props.endTime // Because Simplicate doesn't allow 0-minute logs.
    );
  });
</script>
