<template>
  <section>
    <VueMultiselect
      v-model="currentProject"
      :options="availableProjects"
      :loading="gettingAvailableProjects"
      label="name"
      v-bind="vmsOptions"
      placeholder="Selecteer een project"
    >
      <template #noOptions>
        <span class="dim">{{ gettingAvailableProjects ? 'Bezig met projecten ophalen' : 'Geen projecten beschikbaar' }}</span>
      </template>
    </VueMultiselect>
  </section>

  <section>
    <VueMultiselect
      v-model="currentProjectService"
      :options="availableProjectServices"
      :loading="gettingAvailableProjectServices"
      label="name"
      v-bind="vmsOptions"
      placeholder="Selecteer een dienst"
    >
      <template #noOptions>
        <span class="dim">{{ gettingAvailableProjectServices ? 'Bezig met diensten ophalen' : 'Geen diensten beschikbaar' }}</span>
      </template>
    </VueMultiselect>
  </section>

  <section>
    <VueMultiselect
      v-model="currentProjectServiceHoursType"
      :options="availableProjectServiceHoursTypes"
      :loading="gettingAvailableProjectServiceHoursTypes"
      label="label"
      v-bind="vmsOptions"
      placeholder="Selecteer een type uren"
    >
      <template #noOptions>
        <span class="dim">{{ gettingAvailableProjectServiceHoursTypes ? 'Bezig met type uren ophalen' : 'Geen type uren beschikbaar' }}</span>
      </template>
    </VueMultiselect>
  </section>

  <button
    type="button"
    :disabled="!currentProject || !currentProjectService || !currentProjectServiceHoursType"
  >Start timer</button>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
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

  const availableProjects = ref([]);
  const gettingAvailableProjects = ref(true);
  const currentProject = ref('');

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
    gettingAvailableProjects.value = false;
  }

  ///////////////////////////////////////
  //  PROJECTS SERVICES                //
  ///////////////////////////////////////

  const availableProjectServices = ref([]);
  const gettingAvailableProjectServices = ref(false);
  const currentProjectService = ref(null);

  const clearProjectServices = () => {
    availableProjectServices.value.length = 0;
  };

  const addProjectServices = (services) => {
    availableProjectServices.value.push(...services);
  };

  const getProjectServices = async ({ id: projectId }) => {
    gettingAvailableProjectServices.value = true;

    const { data: services } = await axios.get('hours/projectservices', {
      params: {
        'q[project_id]': projectId,
      },
    });

    clearProjectServices();
    addProjectServices(services.data);
    gettingAvailableProjectServices.value = false;
  };

  ///////////////////////////////////////
  //  PROJECT SERVICE HOURS TYPES      //
  ///////////////////////////////////////

  const availableProjectServiceHoursTypes = ref([]);
  const gettingAvailableProjectServiceHoursTypes = ref(false);
  const currentProjectServiceHoursType = ref(null);

  const clearProjectServiceHoursTypes = () => {
    availableProjectServiceHoursTypes.value.length = 0;
  };

  const addProjectServiceHoursTypes = (serviceHoursTypes) => {
    availableProjectServiceHoursTypes.value.push(...serviceHoursTypes);
  };

  const getProjectServiceHoursTypes = async ({ id: projectId }, { id: projectServiceId }) => {
    gettingAvailableProjectServiceHoursTypes.value = true;

    const { data: serviceHoursTypes } = await axios.get('hours/projectservicehourstypes', {
      params: {
        'q[project_id]': projectId,
        'q[projectservice_id]': projectServiceId,
      },
    });

    clearProjectServiceHoursTypes();
    addProjectServiceHoursTypes(serviceHoursTypes.data);
    gettingAvailableProjectServiceHoursTypes.value = false;
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
          currentProjectService.value = null;
        }

        // If new available project services has only one entry, select it
        if (availableProjectServices.value.length === 1) {
          currentProjectService.value = availableProjectServices.value[0];
        }
      });
    }
    else {
      currentProjectService.value = null;
      clearProjectServices();
    }
  });

  watch(currentProjectService, (newCurrentProjectService) => {
    if (newCurrentProjectService !== null) {
      getProjectServiceHoursTypes(currentProject.value, newCurrentProjectService).then(() => {
        // Reset current project service if service not available in new project
        if (currentProjectServiceHoursType.value !== null
          && availableProjectServiceHoursTypes.value.find(serviceHoursTypes => serviceHoursTypes.id === currentProjectServiceHoursType.value.id) === undefined) {
          currentProjectServiceHoursType.value = null;
        }

        // If new available project service hours types has only one entry, select it
        if (availableProjectServiceHoursTypes.value.length === 1) {
          currentProjectServiceHoursType.value = availableProjectServiceHoursTypes.value[0];
        }
      });
    }
    else {
      currentProjectServiceHoursType.value = null;
      availableProjectServiceHoursTypes.value.length = 0;
    }
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
  }

  .multiselect__select {
    height: 100%;
    width: 2.3em;

    &::before {
      top: 63%;
    }
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
