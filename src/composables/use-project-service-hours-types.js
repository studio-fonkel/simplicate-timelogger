import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';

export const availableProjectServiceHoursTypes = ref([]);
export const loadingAvailableProjectServiceHoursTypes = shallowRef(false);
export const currentProjectServiceHoursType = shallowRef(null);

export function setCurrentProjectServiceHoursType (value) {
  currentProjectServiceHoursType.value = value;
}

export function resetCurrentProjectServiceHoursType () {
  setCurrentProjectServiceHoursType(null);
}

export function selectFirstProjectServiceHoursType () {
  setCurrentProjectServiceHoursType(availableProjectServiceHoursTypes.value[0]);
}

export function clearProjectServiceHoursTypes () {
  availableProjectServiceHoursTypes.value.length = 0;
}

function addProjectServiceHoursTypes (serviceHoursTypes) {
  availableProjectServiceHoursTypes.value.push(...serviceHoursTypes);
}

export async function getProjectServiceHoursTypes ({ id: projectId }, { id: projectServiceId }) {
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
}
