<template>
  <div
    ref="timerForm"
    tabindex="-1"
    class="timer-form"
  >
    <CreateTimerButton v-if="mode === 'hidden'"/>

    <template v-else>
      <section>
        <p class="timer-form__select-label"><strong>Project</strong></p>
        <VueMultiselect
          v-model="currentProject"
          v-bind="vmsOptions"
          :options="filteredProjects"
          :loading="loadingAvailableProjects"
          label="name"
          placeholder="Selecteer een project"
          @remove="preventDeselectProject"
        >
          <template #option="optionProps">
            <span>{{ optionProps.option.name }} ({{ optionProps.option.organization.name }})</span>
          </template>

          <template #singleLabel="singleLabelProps">
            <span class="overflow-ellipsis">{{ singleLabelProps.option.name }} ({{ singleLabelProps.option.organization.name }})</span>
          </template>

          <template #noOptions>
            <span class="dim">
              {{ loadingAvailableProjects ? 'Bezig met projecten ophalen' : 'Geen projecten beschikbaar' }}
            </span>
          </template>
        </VueMultiselect>
      </section>

      <section>
        <p class="timer-form__select-label"><strong>Dienst</strong></p>
        <VueMultiselect
          v-model="currentProjectService"
          :options="availableProjectServices"
          :loading="loadingAvailableProjectServices"
          label="name"
          v-bind="vmsOptions"
          placeholder="Selecteer een dienst"
          @remove="preventDeselectProjectService"
        >
          <template #singleLabel="singleLabelProps">
            <span class="overflow-ellipsis">{{ singleLabelProps.option.name }}</span>
          </template>

          <template #noOptions>
            <span class="dim">
              {{ loadingAvailableProjectServices ? 'Bezig met diensten ophalen' : 'Geen diensten beschikbaar' }}
            </span>
          </template>
        </VueMultiselect>
      </section>

      <section>
        <p class="timer-form__select-label"><strong>Uursoort</strong></p>
        <VueMultiselect
          v-model="currentProjectServiceHoursType"
          :options="availableProjectServiceHoursTypes"
          :loading="loadingAvailableProjectServiceHoursTypes"
          label="label"
          v-bind="vmsOptions"
          placeholder="Selecteer een uursoort"
          @remove="preventDeselectProjectServiceHoursType"
        >
          <template #singleLabel="singleLabelProps">
            <span class="overflow-ellipsis">{{ singleLabelProps.option.label }}</span>
          </template>

          <template #noOptions>
            <span class="dim">
              {{ loadingAvailableProjectServiceHoursTypes ? 'Bezig met uursoorten ophalen' : 'Geen uursoorten beschikbaar' }}
            </span>
          </template>
        </VueMultiselect>
      </section>

      <section>
        <p class="timer-form__select-label"><strong>Omschrijving</strong></p>
        <textarea
          v-model="description"
          rows="3"
        ></textarea>
      </section>

      <section class="split-view">
        <div>
          <p class="timer-form__select-label"><strong>Starttijd</strong></p>
          <div class="timer-form__input-wrapper">
            <input
              v-model="startTime"
              type="text"
              class="timer-form__input"
              @blur="startTime = fixTime(startTime) ?? ''"
              @paste.prevent="(event) => startTime = fixTime((event.clipboardData || window.clipboardData).getData('text')) ?? ''"
            />
            <button
              type="button"
              class="btn--small btn--grey"
              title="Nu"
              @click="startTime = fixTime(getCurrentTimeString()) ?? ''"
            >
              <i class="far fa-clock"></i>
            </button>
          </div>
        </div>

        <div>
          <p class="timer-form__select-label"><strong>Eindtijd</strong></p>
          <div class="timer-form__input-wrapper">
            <input
              v-model="endTime"
              type="text"
              class="timer-form__input"
              @blur="endTime = fixTime(endTime) ?? ''"
              @paste.prevent="(event) => endTime = fixTime((event.clipboardData || window.clipboardData).getData('text')) ?? ''"
            />
            <button
              type="button"
              class="btn--small btn--grey"
              title="Nu"
              @click="endTime = fixTime(getCurrentTimeString()) ?? ''"
            >
              <i class="far fa-clock"></i>
            </button>
          </div>
        </div>
      </section>

      <template v-if="mode === 'add'">
        <StartTimerButton
          v-if="endTime == null || endTime === ''"
          :startTime="startTime"
          :description="description"
          @timer-created="resetTimesAndDescription"
        />
        <CreateHoursButton
          v-else
          :startTime="startTime"
          :endTime="endTime"
          :description="description"
          @hours-created="resetTimesAndDescription"
        />
      </template>
      <template v-else-if="mode === 'edit'">
        <button
          type="button"
          class="btn--green"
          @click="$emit('confirm-edit-hours-entry')"
        >
          Bijwerken
        </button>
        <button
          type="button"
          class="btn--grey"
          @click="$emit('cancel-edit-hours-entry')"
        >
          Annuleer
        </button>
      </template>
    </template>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import VueMultiselect from 'vue-multiselect';
  import CreateTimerButton from './CreateTimerButton.vue';
  import StartTimerButton from './StartTimerButton.vue';
  import CreateHoursButton from './CreateHoursButton.vue';

  import {
    currentlySelectedDate,
    compareDates,
    fixTime,
    getCurrentTimeString,
    toPlainDate,
  } from '../composables/use-date-helper.js';

  import {
    availableProjects,
    loadingAvailableProjects,
    currentProject,
    setCurrentProject,
    fetchProjects,
    startPollingFetchProjects,
    stopPollingFetchProjects,
  } from '../composables/use-projects.js';

  import {
    availableProjectServices,
    loadingAvailableProjectServices,
    currentProjectService,
    setCurrentProjectService,
    resetCurrentProjectService,
    selectFirstProjectService,
    getProjectServices,
    clearProjectServices,
  } from '../composables/use-project-services.js';

  import {
    availableProjectServiceHoursTypes,
    loadingAvailableProjectServiceHoursTypes,
    currentProjectServiceHoursType,
    setCurrentProjectServiceHoursType,
    resetCurrentProjectServiceHoursType,
    selectFirstProjectServiceHoursType,
    clearProjectServiceHoursTypes,
    getProjectServiceHoursTypes,
  } from '../composables/use-project-service-hours-types.js';

  import {
    latestHours,
    latestHoursEntry,
  } from '../composables/use-hours.js';

  const props = defineProps({
    mode: {
      type: String,
      required: true,
      validator: value => ['hidden', 'add', 'edit'].includes(value),
    },
    currentlyEditedHoursEntry: {
      type: [Object, null],
      required: true,
    },
  });

  defineEmits({
    'confirm-edit-hours-entry': null,
    'cancel-edit-hours-entry': null,
  });

  // TODO: Group availableProjects by project_status in projects VueMultiSelect

  const timerForm = ref(null);

  const vmsOptions = {
    'track-by': 'id',
    'multiple': false,
    'searchable': true,
    'close-on-select': true,
    'clear-on-select': false,
    'preselect-first': false,
    'show-no-results': false,
    'select-label': '',
    'selected-label': '',
    'deselect-label': '',
    'deselected-label': '',
    'preserve-search': true,
    'max-height': 500,
  };

  const startTime = ref('');
  const endTime = ref('');
  const description = ref('');

  const resetTimesAndDescription = () => {
    startTime.value = '';
    endTime.value = '';
    description.value = '';
  };

  // Pre-fills the start time field with the current time. Disabled for now, seemed impractical.
  // watchEffect(() => {
  //   if (props.mode === 'add') {
  //     startTime.value = fixTime(getCurrentTimeString());
  //   }
  // });

  const filteredProjects = computed(() => {
    return availableProjects.value.filter(project => {
      // TODO: We need to check if the current employee is assigned to the project. Endpoint is /projects/assignments. (https://developer.simplicate.com/explore#!/Projects/get_projects_assignment)

      // TODO: Check what we can do with project_status
      // console.log({ name: project.name, status: project.project_status.label });

      if (project.end_date == null) {
        return true;
      }
      else {
        // If end date is before currently selected date, project is not available.
        // REVIEW: Double check if this is the reason why we can't log to the "Telemarketing 2021" project, or if it's because of something else.
        if (compareDates(toPlainDate(project.end_date), currentlySelectedDate.value) === -1) {
          return false;
        }
      }
      // NOTE: I tried to make a project the other day and I think a start date is obligatory.
      if (project.start_date == null) {
        return true;
      }
      else {
        // If start date is after currently selected date, project is not available.
        // REVIEW: Double check if this can be the reason why you can't log to a project.
        if (compareDates(toPlainDate(project.start_date), currentlySelectedDate.value) === 1) {
          return false;
        }
      }

      // REVIEW: project.project_status can indicate a project is closed, but I'm not sure how to detect a closed project yet..
      return true;
    });
  });

  // EXCEPTION: This is only necessary because VueMultiselect doesn't support preventing deselects by clicking the active option.
  const preventDeselectProject = (deselectedOption) => {
    nextTick(() => {
      setCurrentProject(deselectedOption);
    });
  };

  // EXCEPTION: This is only necessary because VueMultiselect doesn't support preventing deselects by clicking the active option.
  const preventDeselectProjectService = (deselectedOption) => {
    nextTick(() => {
      setCurrentProjectService(deselectedOption);
    });
  };

  // EXCEPTION: This is only necessary because VueMultiselect doesn't support preventing deselects by clicking the active option.
  const preventDeselectProjectServiceHoursType = (deselectedOption) => {
    nextTick(() => {
      setCurrentProjectServiceHoursType(deselectedOption);
    });
  };

  // Watch for changes in the available projects and pre-fill the last used project.
  watch(availableProjects, () => {
    if (currentProject.value === null && latestHoursEntry.value != null) {
      const lastUsedProject = availableProjects.value
        .find(project => project.id === latestHoursEntry.value.project.id);

      // Try to select the last used project.
      if (lastUsedProject !== undefined) {
        setCurrentProject(lastUsedProject);
      }
    }
  }, { deep: true });

  // Watch current project so we can update the available project services.
  watch(currentProject, (newCurrentProject, oldCurrentProject) => {
    if (newCurrentProject !== null) {
      if (newCurrentProject === oldCurrentProject) {
        return;
      }

      getProjectServices(newCurrentProject).then(() => {
        /** This is `true` if we manually selected a new option already. */
        let hasSelectedNewOption = false;

        // Reset current project service if service not available in new project.
        if (currentProjectService.value !== null) {
          const serviceWithSameID = availableProjectServices.value.find((service) => {
            return service.id === currentProjectService.value.id;
          });

          const serviceWithSameName = availableProjectServices.value.find((service) => {
            return service.name === currentProjectService.value.name;
          });

          // If exact same service is available in new project, select it.
          if (serviceWithSameID !== undefined) {
            hasSelectedNewOption = true;
            // Select service with same id after this. We need to because the option objects are not the same.
            setCurrentProjectService(serviceWithSameID);
          }
          else if (serviceWithSameName !== undefined) {
            hasSelectedNewOption = true;
            // Select service with same name after this. We need to because the option objects are not the same.
            setCurrentProjectService(serviceWithSameName);
          }
          else {
            resetCurrentProjectService();
          }
        }

        if (hasSelectedNewOption === false) {
          // If new available project services has only one entry, select it.
          if (availableProjectServices.value.length === 1) {
            selectFirstProjectService();
          }
          // Otherwise, try to select the last used project services.
          // TODO: Consider moving this to before checking for a project service with the same name/id.
          else {
            const latestHoursEntryWithProject = latestHours.value.find((hoursEntry) => {
              return hoursEntry.project.id === newCurrentProject.id;
            });

            if (latestHoursEntryWithProject !== undefined) {
              const usedProjectService = availableProjectServices.value
                .find(projectService => projectService.id === latestHoursEntryWithProject.projectservice.id);

              if (usedProjectService !== undefined) {
                setCurrentProjectService(usedProjectService);
              }
            }
          }
        }
      });
    }
    else {
      resetCurrentProjectService();
      clearProjectServices();
    }
  });

  // Watch current project service so we can update the available project service hours types.
  watch(currentProjectService, (newCurrentProjectService, oldCurrentProjectService) => {
    if (newCurrentProjectService !== null) {
      if (newCurrentProjectService === oldCurrentProjectService) {
        return;
      }

      getProjectServiceHoursTypes(currentProject.value, newCurrentProjectService).then(() => {
        /** This is `true` if we manually selected a new option already. */
        let hasSelectedNewOption = false;

        // Reset current project service if service not available in new project.
        if (currentProjectServiceHoursType.value !== null) {
          const serviceHoursTypeWithSameID = availableProjectServiceHoursTypes.value.find((serviceHoursTypes) => {
            return serviceHoursTypes.id === currentProjectServiceHoursType.value.id;
          });

          const serviceHoursTypeWithSameLabel = availableProjectServiceHoursTypes.value.find((serviceHoursTypes) => {
            return serviceHoursTypes.label === currentProjectServiceHoursType.value.label;
          });

          // If exact same service hours type is available in new project, select it.
          if (serviceHoursTypeWithSameID !== undefined) {
            hasSelectedNewOption = true;
            // Select service hours type with same id after this. We need to because the option objects are not the same.
            setCurrentProjectServiceHoursType(serviceHoursTypeWithSameID);
          }
          else if (serviceHoursTypeWithSameLabel !== undefined) {
            hasSelectedNewOption = true;
            // Select service hours type with same label after this. We need to because the option objects are not the same.
            setCurrentProjectServiceHoursType(serviceHoursTypeWithSameLabel);
          }
          else {
            resetCurrentProjectServiceHoursType();
          }
        }

        if (hasSelectedNewOption === false) {
          // If new available project service hours types has only one entry, select it.
          if (availableProjectServiceHoursTypes.value.length === 1) {
            selectFirstProjectServiceHoursType();
          }
          // Otherwise, try to select the last used project services hours type.
          // TODO: Consider moving this to before checking for a project service hours type with the same label/id.
          else {
            const latestHoursEntryWithProjectAndProjectService = latestHours.value.find((hoursEntry) => {
              return (
                hoursEntry.project.id === currentProject.value.id
                && hoursEntry.projectservice.id === newCurrentProjectService.id
              );
            });

            if (latestHoursEntryWithProjectAndProjectService !== undefined) {
              const usedProjectServiceHoursType = availableProjectServiceHoursTypes.value
                .find(projectServiceHoursType => projectServiceHoursType.id === latestHoursEntryWithProjectAndProjectService.type.id);

              if (usedProjectServiceHoursType !== undefined) {
                setCurrentProjectServiceHoursType(usedProjectServiceHoursType);
              }
            }
          }
        }
      });
    }
    else {
      resetCurrentProjectServiceHoursType();
      clearProjectServiceHoursTypes();
    }
  });

  onMounted(() => {
    // Trap focus inside this component, so user can tab directly to first select.
    timerForm.value.focus();

    // On init, fetch all projects and start polling.
    fetchProjects();
    startPollingFetchProjects();
  });

  onBeforeUnmount(() => {
    stopPollingFetchProjects();
  });
</script>

<style lang="scss">
  .timer-form {
    // This aligns the top of the form with the bottom of the date-browser.
    padding-top: var(--current-date-browser-height, 0);

    &:focus {
      outline: none;
    }

    section {
      position: relative;
      margin: 1em 0;

      &:first-child {
        margin-top: 0;

        // This aligns the top of the form with the bottom of the date-browser.
        .timer-form__select-label {
          position: absolute;
          bottom: 100%;
        }
      }
      &:last-child {
        margin-bottom: 0;
      }

      .timer-form__select-label {
        font-size: 70%;
        margin: 0 0 0.5em;
      }

      .timer-form__input-wrapper {
        position: relative;

        button {
          position: absolute;
          top: 50%;
          right: 12px;
          font-size: 0.8em;
          transform: translateY(-50%);
          transition-property: opacity, visibility;
          transition-duration: 0.1s;
          transition-timing-function: ease-out;
        }

        &:not(:focus-within):not(:hover) {
          button {
            visibility: hidden;
            opacity: 0;
          }
        }
      }

      &.split-view {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 1em;

        > * {
          flex: 0 1 auto;
          width: calc(50% - 0.5em);

          input {
            width: 100%;
          }
        }
      }
    }

    section + button {
      margin-top: 0.25em;
    }

    button + button {
      margin-left: 0.5em;
    }
  }
</style>
