import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';

export const availableProjectServices = ref([]);
export const loadingAvailableProjectServices = shallowRef(false);
export const currentProjectService = shallowRef(null);

function setCurrentProjectService (value) {
  currentProjectService.value = value;
}

export function resetCurrentProjectService () {
  setCurrentProjectService(null);
}

export function selectFirstProjectService () {
  setCurrentProjectService(availableProjectServices.value[0]);
}

export function clearProjectServices () {
  availableProjectServices.value.length = 0;
}

function addProjectServices (services) {
  availableProjectServices.value.push(...services);
}

export async function getProjectServices ({ id: projectId }) {
  loadingAvailableProjectServices.value = true;

  const { data: services } = await axios.get('hours/projectservices', {
    params: {
      'q[project_id]': projectId,
    },
  });

  clearProjectServices();
  addProjectServices(services.data);
  loadingAvailableProjectServices.value = false;
}
