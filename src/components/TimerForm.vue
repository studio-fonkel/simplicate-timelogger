<template>
  <div class="timer-form">
    <CreateTimerButton v-if="mode === 'hidden'"/>

    <template v-else>
      <section>
        <p class="timer-form__select-label"><strong>Project</strong></p>
        <VueMultiselect
          v-bind="vmsOptions"
          ref="firstSelect"
          v-model="currentProject"
          :options="availableProjects"
          :loading="loadingAvailableProjects"
          label="name"
          placeholder="Selecteer een project"
          @remove="preventDeselectProject"
        >
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
          <template #noOptions>
            <span class="dim">
              {{ loadingAvailableProjectServiceHoursTypes ? 'Bezig met uursoorten ophalen' : 'Geen uursoorten beschikbaar' }}
            </span>
          </template>
        </VueMultiselect>
      </section>

      <!-- Later on, add option to define both start and end time and show different button to directly create a log -->
      <template v-if="mode === 'add'">
        <StartTimerButton/>
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
  import { ref, watch, onMounted, nextTick } from 'vue';
  import VueMultiselect from 'vue-multiselect';
  import CreateTimerButton from './CreateTimerButton.vue';
  import StartTimerButton from './StartTimerButton.vue';

  import {
    availableProjects,
    loadingAvailableProjects,
    currentProject,
    setCurrentProject,
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

  defineProps({
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

  const firstSelect = ref(null);

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

        // If new available project services has only one entry, select it.
        if (hasSelectedNewOption === false && availableProjectServices.value.length === 1) {
          selectFirstProjectService();
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

        // If new available project service hours types has only one entry, select it.
        if (hasSelectedNewOption === false && availableProjectServiceHoursTypes.value.length === 1) {
          selectFirstProjectServiceHoursType();
        }
      });
    }
    else {
      resetCurrentProjectServiceHoursType();
      clearProjectServiceHoursTypes();
    }
  });

  onMounted(() => {
    firstSelect.value.$el.focus();
  });
</script>

<style lang="scss">
  .timer-form {
    section {
      margin: 1em 0;

      &:first-child {
        margin-top: 0;
      }
      &:last-child {
        margin-bottom: 0;
      }

      .timer-form__select-label {
        font-size: 70%;
        margin: 0 0 0.5em;
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
