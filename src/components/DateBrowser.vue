<template>
  <div class="date-browser">
    <button
      type="button"
      class="btn--grey"
      @click="goToPreviousDay"
    >
      <i class="fas fa-chevron-left"></i>
    </button>

    <h3
      class="inline-block margin-0"
      :class="{
        'date-browser__date-is-today': currentlySelectedDate.equals(today),
      }"
    >
      {{ toFullDate(currentlySelectedDate.toString()) }}
    </h3>

    <button
      type="button"
      class="btn--grey"
      @click="goToNextDay"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
</template>

<script setup>
  import {
    initiallyLoadedEmployeeHours,
    currentlySelectedDate,
    fetchHours,
  } from '../composables/use-hours.js';

  import { today, toFullDate } from '../composables/use-date-helper.js';

  const goToPreviousDay = () => {
    currentlySelectedDate.value = currentlySelectedDate.value.subtract({ days: 1 });
    initiallyLoadedEmployeeHours.value = false;
    fetchHours();
  };

  const goToNextDay = () => {
    currentlySelectedDate.value = currentlySelectedDate.value.add({ days: 1 });
    initiallyLoadedEmployeeHours.value = false;
    fetchHours();
  };
</script>

<style lang="scss">
  .date-browser {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__date-is-today {
      color: $green-7;
    }
  }
</style>
