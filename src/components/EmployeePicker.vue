<template>
  <div
    class="employee-picker"
    :class="{
      'employee-picker--centered': currentEmployeeID == null,
    }"
  >
    <VueMultiselect
      v-model="currentEmployee"
      v-bind="vmsOptions"
      :options="sortedEmployees"
      :loading="loadingEmployees"
    >
      <template #noOptions>
        <span class="dim">
          {{ loadingEmployees ? 'Bezig met werknemers ophalen' : 'Geen werknemers gevonden' }}
        </span>
      </template>
    </VueMultiselect>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import VueMultiselect from 'vue-multiselect';
  import { employees, loadingEmployees, currentEmployee, currentEmployeeID } from '../composables/use-employees.js';

  const sortedEmployees = computed(() => {
    const employeesClone = ref(employees.value.slice());
    return employeesClone.value.sort((a, b) => (a.name < b.name ? -1 : 1));
  });

  const vmsOptions = {
    'track-by': 'id',
    'label': 'name',
    'placeholder': 'Wie ben jij?',
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
    'max-height': 500,
  };
</script>

<style lang="scss">
  .employee-picker {
    position: fixed;
    z-index: 1000;

    &.employee-picker--centered {
      top: 50%;
      left: 50%;
      width: 500px;
      font-size: 120%;
      transform: translate(-50%, -50%);
    }

    &:not(.employee-picker--centered) {
      top: 15px;
      right: 15px;
      width: 230px;
      font-size: 80%;
    }
  }
</style>
