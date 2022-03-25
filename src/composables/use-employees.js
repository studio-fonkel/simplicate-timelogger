import { ref, shallowRef, computed, watch } from 'vue';
import { localStoragePrefix } from '../config.js';
import { axios } from './use-axios.js';

const storageKey = `${localStoragePrefix}currentEmployeeID`;

// TODO: Shouldn't we set storageEmployeeID as well when updating the value in localStorage?
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
  else {
    localStorage.removeItem(storageKey);
    showEmployeePicker.value = true;
  }
});

export const employeePickerVisible = computed(() => {
  const noCurrentEmployee = currentEmployeeID.value == null;
  const doShowEmployeePicker = showEmployeePicker.value === true;
  return noCurrentEmployee || doShowEmployeePicker;
});

// Sets currentEmployee based on which and how many accessible employees
// are found in Simplicate.
watch(employees.value, (newEmployees) => {
  if (storedEmployeeID != null) {
    if (Array.isArray(newEmployees)) {
      const employee = newEmployees.find(employee => employee.id === storedEmployeeID);

      // If stored employee ID exists in employee list, set current employee
      // to employee with the stored employee ID.
      if (employee !== undefined) {
        currentEmployee.value = employee;
        return;
      }
    }
  }

  // Auto-select first employee if there’s only one available.
  if (Array.isArray(newEmployees) && newEmployees.length === 1) {
    // eslint-disable-next-line prefer-destructuring
    currentEmployee.value = newEmployees[0];
    return;
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
