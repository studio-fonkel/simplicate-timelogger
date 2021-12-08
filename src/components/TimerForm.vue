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
  import { watch } from 'vue';
  import VueMultiselect from 'vue-multiselect';
  import CreateTimerButton from './CreateTimerButton.vue';
  import StartTimerButton from './StartTimerButton.vue';

  import {
    availableProjects,
    loadingAvailableProjects,
    currentProject,
  } from '../composables/use-projects.js';

  import {
    availableProjectServices,
    loadingAvailableProjectServices,
    currentProjectService,
    resetCurrentProjectService,
    selectFirstProjectService,
    getProjectServices,
    clearProjectServices,
  } from '../composables/use-project-services.js';

  import {
    availableProjectServiceHoursTypes,
    loadingAvailableProjectServiceHoursTypes,
    currentProjectServiceHoursType,
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
      type: Object,
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
  };

  // Watch current project so we can update the available project services.
  watch(currentProject, (newCurrentProject) => {
    if (newCurrentProject !== null) {
      getProjectServices(newCurrentProject).then(() => {
        // Reset current project service if service not available in new project.
        if (currentProjectService.value !== null
          && availableProjectServices.value.find(service => service.id === currentProjectService.value.id) === undefined) {
          resetCurrentProjectService();
        }

        // If new available project services has only one entry, select it.
        if (availableProjectServices.value.length === 1) {
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
  watch(currentProjectService, (newCurrentProjectService) => {
    if (newCurrentProjectService !== null) {
      getProjectServiceHoursTypes(currentProject.value, newCurrentProjectService).then(() => {
        // Reset current project service if service not available in new project.
        if (currentProjectServiceHoursType.value !== null
          && availableProjectServiceHoursTypes.value.find(serviceHoursTypes => serviceHoursTypes.id === currentProjectServiceHoursType.value.id) === undefined) {
          resetCurrentProjectServiceHoursType();
        }

        // If new available project service hours types has only one entry, select it.
        if (availableProjectServiceHoursTypes.value.length === 1) {
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
      background-color: #24b0f1;
    }

    &--selected {
      font-weight: inherit;
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
