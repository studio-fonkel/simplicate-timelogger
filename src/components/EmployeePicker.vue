<template>
  <div
    class="employee-picker"
    :class="{
      'employee-picker--pick': employeePickerVisible === true,
    }"
  >
    <VueMultiselect
      v-if="employeePickerVisible === true"
      v-bind="vmsOptions"
      ref="multiselect"
      v-model="currentEmployee"
      :options="sortedEmployees"
      :loading="loadingEmployees"
      @close="onClose"
    >
      <template #noOptions>
        <span class="dim">
          {{ loadingEmployees ? 'Bezig met werknemers ophalen' : 'Geen werknemers gevonden' }}
        </span>
      </template>
    </VueMultiselect>

    <div
      v-else
      class="employee-initials"
      :style="`--employee-avatar-color: ${currentEmployee?.avatar?.color}`"
      tabindex="0"
      @click="showEmployeePicker = true"
      @keydown.space="showEmployeePicker = true"
      @keydown.enter="showEmployeePicker = true"
    >
      {{ currentEmployee?.avatar?.initials }}
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, nextTick } from 'vue';
  import VueMultiselect from 'vue-multiselect';

  import {
    employees,
    loadingEmployees,
    currentEmployee,
    showEmployeePicker,
    employeePickerVisible,
  } from '../composables/use-employees.js';

  // When employee picker becomes visible, give focus to the multiselect.
  const multiselect = ref(null);
  watch(employeePickerVisible, (newVisibleStatus) => {
    if (newVisibleStatus === true) {
      nextTick(() => {
        multiselect.value.$el.focus();
      });
    }
  });

  // When the employee picker is visible and an employee is already selected,
  // we can safely hide the employee picker. This feels better UX-wise.
  const onClose = (value) => {
    if (value != null) {
      showEmployeePicker.value = false;
    }
  };

  // Sort employee names alphabetically.
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

    &.employee-picker--pick {
      top: 15%;
      left: 50%;
      width: 500px;
      font-size: 120%;
      transform: translate(-50%, -50%);
    }

    &:not(.employee-picker--pick) {
      top: 20px;
      right: 20px;
      font-size: 80%;
    }

    .employee-initials {
      display: flex;;
      justify-content: center;
      align-items: center;
      aspect-ratio: 1 / 1;
      padding: 0.75em 0.7em 0.7em;
      min-width: 3.5em;
      border-radius: 50%;
      background-color: var(--employee-avatar-color);
      color: white;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.1s ease-out;

      &:hover {
        opacity: 0.8;
      }

      &::after {
        all: inherit;
        content: "";
        position: absolute;
        box-shadow: 0 3px 20px -4px var(--employee-avatar-color);
        z-index: -1;
        background-color: transparent;
        opacity: 0.35;
        filter: saturate(1.2) brightness(0.7);
      }
    }
  }
</style>
