<template>
  <div class="timer-form">
    <CreateTimerButton v-if="mode === 'hidden'"/>

    <template v-else>
      <section>
        <VueMultiselect
          v-model="currentProject"
          :options="availableProjects"
          :loading="loadingAvailableProjects"
          label="name"
          v-bind="vmsOptions"
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
        <VueMultiselect
          v-model="currentProjectServiceHoursType"
          :options="availableProjectServiceHoursTypes"
          :loading="loadingAvailableProjectServiceHoursTypes"
          label="label"
          v-bind="vmsOptions"
          placeholder="Selecteer een type uren"
          @remove="preventDeselectProjectServiceHoursType"
        >
          <template #noOptions>
            <span class="dim">
              {{ loadingAvailableProjectServiceHoursTypes ? 'Bezig met type uren ophalen' : 'Geen type uren beschikbaar' }}
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
  import { watch, nextTick } from 'vue';
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
</script>

<style lang="scss">
  .multiselect {
    cursor: pointer;

    &:hover,
    &:focus-within {
      .multiselect__tags {
        background: linear-gradient(to bottom, #fdfdfd, #f5f5f5);
      }
    }
  }

  .multiselect__tags,
  .multiselect, .multiselect__input,
  .multiselect__single {
    font-size: inherit;
    line-height: 1.8em;
  }

  .multiselect__tags {
    padding-top: 0.45em;
    padding-left: 0.75em;
    border: 1px solid $grey-7;
  }

  .multiselect__content-wrapper {
    box-shadow: 0 3px 12px -8px $grey-6;
  }

  .multiselect__option {
    min-height: auto;
    box-sizing: content-box;
    display: flex;
    align-items: center;
    padding: 0.97em 0 0.86em;
    line-height: inherit;
    font-size: 0.8em;
    transition-property: background-color, color;
    transition-duration: 0.075s;
    transition-timing-function: ease-out;

    &--highlight {
      background-color: #00b86b !important;
      color: $white-0 !important;
    }

    &--selected {
      font-weight: 700 !important;
      background-color: #ebf7f2;
    }

    span {
      line-height: 1;
      padding-left: 1em;
      padding-right: 1em;
    }
  }

  .multiselect__content,
  .multiselect__element,
  .multiselect__single,
  .multiselect__option {
    width: 100%;
  }

  .multiselect__single,
  .multiselect__option {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    font-weight: 500;
  }

  .multiselect__single,
  .multiselect__input {
    padding-left: 0;
    background: none;
  }

  .multiselect__placeholder {
    padding-top: 0;
    margin-bottom: 8px;
  }

  .multiselect__select {
    height: calc(100% - 2px);
    width: 2.3em;

    &::before {
      top: 68%;
    }
  }

  .multiselect__loading-leave-active {
    transition-duration: 0.2s;
  }

  .multiselect__spinner {
    height: calc(100% - 2px);
    width: 2.3em;
    top: 1px;
  }
</style>

<style scoped lang="scss">
  section {
    margin: 1em 0;

    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }

  button + button {
    margin-left: 0.5em;
  }
</style>
