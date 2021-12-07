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
        <span class="dim">{{ loadingAvailableProjects ? 'Bezig met projecten ophalen' : 'Geen projecten beschikbaar' }}</span>
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
        <span class="dim">{{ loadingAvailableProjectServices ? 'Bezig met diensten ophalen' : 'Geen diensten beschikbaar' }}</span>
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
        <span class="dim">{{ loadingAvailableProjectServiceHoursTypes ? 'Bezig met type uren ophalen' : 'Geen type uren beschikbaar' }}</span>
      </template>
    </VueMultiselect>
  </section>

  <button
    type="button"
    :disabled="timerButtonEnabled === false"
  >Start timer</button>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import axiosPlugin from 'axios';
  import VueMultiselect from 'vue-multiselect';

  const axios = axiosPlugin.create({
    baseURL: 'https://demofonkel.simplicate.nl/api/v2/',
    timeout: 3000,
    headers: {
      'Authentication-Key': import.meta.env.VITE_API_KEY,
      'Authentication-Secret': import.meta.env.VITE_API_SECRET,
    }
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

  ///////////////////////////////////////
  //  PROJECTS                         //
  ///////////////////////////////////////

  const availableProjects = ref([]); // REVIEW: Use shallowRef?
  const loadingAvailableProjects = ref(true);
  const currentProject = ref(null); // REVIEW: Use shallowRef?

  const clearProjects = () => {
    availableProjects.value.length = 0;
  };

  const addProjects = (projects) => {
    availableProjects.value.push(...projects);
  };

  const getProjects = async () => {
    const { data: projects } = await axios.get('projects/project');
    clearProjects();
    addProjects(projects.data);
    loadingAvailableProjects.value = false;
  }

  ///////////////////////////////////////
  //  PROJECTS SERVICES                //
  ///////////////////////////////////////

  const availableProjectServices = ref([]); // REVIEW: Use shallowRef?
  const loadingAvailableProjectServices = ref(false);
  const currentProjectService = ref(null); // REVIEW: Use shallowRef?

  const setCurrentProjectService = (value) => {
    currentProjectService.value = value;
  };

  const resetCurrentProjectService = () => {
    setCurrentProjectService(null);
  };

  const selectFirstProjectService = () => {
    setCurrentProjectService(availableProjectServices.value[0]);
  };

  const clearProjectServices = () => {
    availableProjectServices.value.length = 0;
  };

  const addProjectServices = (services) => {
    availableProjectServices.value.push(...services);
  };

  const getProjectServices = async ({ id: projectId }) => {
    loadingAvailableProjectServices.value = true;

    const { data: services } = await axios.get('hours/projectservices', {
      params: {
        'q[project_id]': projectId,
      },
    });

    clearProjectServices();
    addProjectServices(services.data);
    loadingAvailableProjectServices.value = false;
  };

  ///////////////////////////////////////
  //  PROJECT SERVICE HOURS TYPES      //
  ///////////////////////////////////////

  const availableProjectServiceHoursTypes = ref([]); // REVIEW: Use shallowRef?
  const loadingAvailableProjectServiceHoursTypes = ref(false);
  const currentProjectServiceHoursType = ref(null); // REVIEW: Use shallowRef?

  const setCurrentProjectServiceHoursType = (value) => {
    currentProjectServiceHoursType.value = value;
  };

  const resetCurrentProjectServiceHoursType = () => {
    setCurrentProjectServiceHoursType(null);
  };

  const selectFirstProjectServiceHoursType = () => {
    setCurrentProjectServiceHoursType(availableProjectServiceHoursTypes.value[0]);
  };

  const clearProjectServiceHoursTypes = () => {
    availableProjectServiceHoursTypes.value.length = 0;
  };

  const addProjectServiceHoursTypes = (serviceHoursTypes) => {
    availableProjectServiceHoursTypes.value.push(...serviceHoursTypes);
  };

  const getProjectServiceHoursTypes = async ({ id: projectId }, { id: projectServiceId }) => {
    loadingAvailableProjectServiceHoursTypes.value = true;

    const { data: serviceHoursTypes } = await axios.get('hours/projectservicehourstypes', {
      params: {
        'q[project_id]': projectId,
        'q[projectservice_id]': projectServiceId,
      },
    });

    clearProjectServiceHoursTypes();
    addProjectServiceHoursTypes(serviceHoursTypes.data);
    loadingAvailableProjectServiceHoursTypes.value = false;
  };

  ///////////////////////////////////////
  //  WATCHs                           //
  ///////////////////////////////////////

  watch(currentProject, (newCurrentProject) => {
    if (newCurrentProject !== null) {
      getProjectServices(newCurrentProject).then(() => {
        // Reset current project service if service not available in new project
        if (currentProjectService.value !== null
          && availableProjectServices.value.find(service => service.id === currentProjectService.value.id) === undefined) {
          resetCurrentProjectService();
        }

        // If new available project services has only one entry, select it
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

  watch(currentProjectService, (newCurrentProjectService) => {
    if (newCurrentProjectService !== null) {
      getProjectServiceHoursTypes(currentProject.value, newCurrentProjectService).then(() => {
        // Reset current project service if service not available in new project
        if (currentProjectServiceHoursType.value !== null
          && availableProjectServiceHoursTypes.value.find(serviceHoursTypes => serviceHoursTypes.id === currentProjectServiceHoursType.value.id) === undefined) {
          resetCurrentProjectServiceHoursType();
        }

        // If new available project service hours types has only one entry, select it
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

  ///////////////////////////////////////
  //  CREATED                          //
  ///////////////////////////////////////

  getProjects();
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
    color: white;
    border: none;
    border-radius: 100px;
    padding: 0.7em 1.4em;
    font-size: inherit;
    font-weight: 500;
    // transition: background-color 0.1s ease-out;

    &:not(:disabled) {
      background-color: #26c018;
      box-shadow: 0 5px 15px -3px rgba(#0a2507, 0.2);
      cursor: pointer;

      &:hover,
      &:focus {
        background-color: #1fa313;
      }
    }

    &:disabled {
      background-color: #bbbbbb;
      box-shadow: 0 5px 15px -3px rgba(#585858, 0.2);
    }
  }

  .multiselect {
    cursor: text;
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
    padding: 0.45em 0.75em;
    line-height: inherit;

    &--highlight {
      background-color: #24b0f1;
    }
  }

  .multiselect__single,
  .multiselect__input {
    padding-left: 0;
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

    // &::before,
    // &::after {
    // }
  }
</style>
