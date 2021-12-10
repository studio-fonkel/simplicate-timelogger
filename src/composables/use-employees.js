import { ref, shallowRef, computed, watch } from 'vue';
import { axios } from './use-axios.js';

const storageKey = 'simplicate_timelogger:currentEmployeeID';
const storedEmployeeID = localStorage.getItem(storageKey);

export const employees = ref([]);
export const loadingEmployees = shallowRef(false);
export const showEmployeePicker = shallowRef(false);
export const currentEmployee = shallowRef(null);
export const currentEmployeeID = computed(() => {
  return currentEmployee.value?.id ?? null;
});

watch(currentEmployeeID, (newEmployeeID) => {
  if (newEmployeeID != null) {
    if (newEmployeeID !== storedEmployeeID) {
      localStorage.setItem(storageKey, newEmployeeID);
    }

    showEmployeePicker.value = false;
  }
});

export const employeePickerVisible = computed(() => {
  const noCurrentEmployee = currentEmployeeID.value == null;
  const doShowEmployeePicker = showEmployeePicker.value === true;
  return noCurrentEmployee || doShowEmployeePicker;
});

watch(employees.value, (newEmployees) => {
  if (storedEmployeeID != null && Array.isArray(newEmployees)) {
    const employee = newEmployees.find((employee) => employee.id === storedEmployeeID);
    if (employee !== undefined) {
      currentEmployee.value = employee;
    }
  }
});

function clearEmployees () {
  employees.value.length = 0;
}

function storeEmployees (projects) {
  employees.value.push(...projects);
}

export async function fetchEmployees () {
  loadingEmployees.value = true;
  const { data: employees } = await axios.get('hrm/employee');
  clearEmployees();
  storeEmployees(employees.data);
  loadingEmployees.value = false;
}

// On init, fetch all employees and start polling.
fetchEmployees();
