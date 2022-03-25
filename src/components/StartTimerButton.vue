<template>
  <button
    type="button"
    class="btn--green"
    :disabled="startTimerButtonEnabled === false"
    @click="doCreateTimer"
  >
    Start timer
  </button>
</template>

<script setup>
  import { ref, computed } from 'vue';

  import { RESULT_CODES } from '../composables/use-misc.js';
  import { createTimer, creatingTimer, getTimerStartDateTime } from '../composables/use-timer.js';
  import { currentProject, loadingAvailableProjects } from '../composables/use-projects.js';
  import { currentProjectService, loadingAvailableProjectServices } from '../composables/use-project-services.js';
  import { currentProjectServiceHoursType, loadingAvailableProjectServiceHoursTypes } from '../composables/use-project-service-hours-types.js';
  import { compareDateTimes, fixTime, getCurrentDateTime } from '../composables/use-date-helper.js';

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

  // TODO: Use `today`
  const currentDateTime = ref(getCurrentDateTime());
  setInterval(() => {
    currentDateTime.value = getCurrentDateTime();
  }, 1000);

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

  // REVIEW: Maybe it’s bad UX to disable this button when things are loading. It could cause clicks to be lost.
  const startTimerButtonEnabled = computed(() => {
    try {
      // These are the minimum requirements for the start timer button to be enabled.
      const basicConditions = (
        creatingTimer.value !== true
        && currentProject.value !== null
        && currentProjectService.value !== null
        && currentProjectServiceHoursType.value !== null
        && loadingAvailableProjects.value !== true
        && loadingAvailableProjectServices.value !== true
        && loadingAvailableProjectServiceHoursTypes.value !== true
      );

      if (basicConditions === false) {
        return false;
      }

      // If start time is filled in, start time cannot be later than now.
      if (fixTime(props.startTime) !== null) {
        const now = currentDateTime.value;
        const nowWithoutSeconds = now.round({ smallestUnit: 'minute', roundingMode: 'floor' });

        // Get PlainDateTime obj of startTime.
        const startDateTime = getTimerStartDateTime(fixTime(props.startTime) ?? now);
        const startDateTimeWithoutSeconds = startDateTime.round({ smallestUnit: 'minute', roundingMode: 'floor' });

        if (compareDateTimes(startDateTimeWithoutSeconds, nowWithoutSeconds) === 1) {
          return false;
        }
      }

      // In all other cases, the button is enabled.
      return true;
    }
    catch (err) {
      console.error(`Could not determine if start timer button should be enabled.`, { err });
      return false;
    }
  });
</script>
