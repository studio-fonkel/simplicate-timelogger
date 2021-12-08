<template>
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

  <StartTimerButton/>
</template>

<script setup>
  import { watch } from 'vue';
  import VueMultiselect from 'vue-multiselect';
  import StartTimerButton from './components/StartTimerButton.vue';

  import {
    availableProjects,
    loadingAvailableProjects,
    currentProject,
    fetchAllProjects,
  } from './composables/use-projects.js';

  import {
    availableProjectServices,
    loadingAvailableProjectServices,
    currentProjectService,
    resetCurrentProjectService,
    selectFirstProjectService,
    getProjectServices,
    clearProjectServices,
  } from './composables/use-project-services.js';

  import {
    availableProjectServiceHoursTypes,
    loadingAvailableProjectServiceHoursTypes,
    currentProjectServiceHoursType,
    resetCurrentProjectServiceHoursType,
    selectFirstProjectServiceHoursType,
    clearProjectServiceHoursTypes,
    getProjectServiceHoursTypes,
  } from './composables/use-project-service-hours-types.js';

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

  // On init, fetch all projects.
  fetchAllProjects();
</script>

<style lang="scss">
  body {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    font-size: 1.2rem;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }

  .dim {
    color: #bbb;
  }

  section {
    margin: 1em auto;
    max-width: 400px;
  }

  button {
    appearance: none;
    border: none;
    border-radius: 100px;
    padding: 0.7em 1.4em;
    font-size: inherit;
    font-weight: 500;
  }

  .multiselect {
    // cursor: text;
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

  .multiselect__option {
    padding: 0.32em 0.75em;
    line-height: inherit;
    font-size: 0.875em;
    transition-property: background-color, color;
    transition-duration: 0.075s;
    transition-timing-function: ease-out;

    &--highlight {
      background-color: #24b0f1;
    }

    &--selected {
      font-weight: inherit;
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
    height: 100%;
    width: 2.3em;

    &::before {
      top: 63%;
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
