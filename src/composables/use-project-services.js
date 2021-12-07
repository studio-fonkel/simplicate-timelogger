import { ref } from 'vue';
import { axios } from './use-axios.js';

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

export {
  availableProjectServices,
  loadingAvailableProjectServices,
  currentProjectService,
  resetCurrentProjectService,
  selectFirstProjectService,
  getProjectServices,
  clearProjectServices,
};