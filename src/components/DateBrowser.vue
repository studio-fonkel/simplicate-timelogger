<template>
  <div ref="dateBrowser" class="date-browser">
    <div class="date-browser__buttons-left">
      <button
        type="button"
        class="btn--grey"
        @click="goToPreviousDay"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
    </div>

    <h3
      class="date-browser__date"
      :class="{
        'date-browser__date--past': compareDates(currentlySelectedDate, currentDate) === -1,
        'date-browser__date--today': compareDates(currentlySelectedDate, currentDate) === 0,
      }"
    >
      {{ toFullDate(currentlySelectedDate.toString()) }}
      {{ currentlySelectedDate.equals(currentDate) ? ' (vandaag)' : '' }}
    </h3>

    <div class="date-browser__buttons-right">
      <button
        type="button"
        class="btn--grey btn--refresh"
        @click="refresh"
      >
        <i class="fa fa-refresh"></i>
      </button>

      <button
        type="button"
        class="btn--grey"
        @click="goToNextDay"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';

  import {
    initiallyLoadedEmployeeHours,
    fetchHours,
  } from '../composables/use-hours.js';

  import {
    currentDate,
    currentlySelectedDate,
    toFullDate,
    compareDates,
  } from '../composables/use-date-helper.js';

  const dateBrowser = ref(null);

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

  const refresh = () => {
    initiallyLoadedEmployeeHours.value = false;
    fetchHours();
  };

  // All this ResizeObserver nonsense makes sure we can align the top of the timer-form with the bottom of the date-browser.
  const observedObjects = new Map;
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { target, borderBoxSize } = entry;
      const varName = observedObjects.get(target);

      const cs = getComputedStyle(target);
      const marginBlock = parseFloat(cs.getPropertyValue('margin-bottom')) + parseFloat(cs.getPropertyValue('margin-top'));

      document.documentElement.style.setProperty(
        `--current-${varName}-height`,
        `${(Array.isArray(borderBoxSize) ? borderBoxSize[0] : borderBoxSize).blockSize + marginBlock}px`,
      );
    }
  });

  onMounted(() => {
    observedObjects.set(dateBrowser.value, 'date-browser');
    resizeObserver.observe(dateBrowser.value);
  });

  onBeforeUnmount(() => {
    resizeObserver.unobserve(dateBrowser.value);
    observedObjects.delete(dateBrowser.value);
  });
</script>

<style lang="scss">
  .date-browser {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-items: center;
    column-gap: 1ch;
    row-gap: 1em;

    &__date {
      display: inline-block;
      margin: 0;
      flex: 0 1 auto;

      @media screen and (max-width: 920px) {
        order: -1;
        flex: 0 0 100%;
        text-align: center;
      }
    }

    &__buttons-left,
    &__buttons-right {
      flex: 1 1 0;
      display: flex;
      align-items: stretch;
      gap: 1ch;
    }
    &__buttons-left {
      justify-content: flex-start;
    }
    &__buttons-right {
      justify-content: flex-end;
    }

    &__date--past {
      color: $grey-6;
    }
    &__date--today {
      color: $blue-9;
    }
  }
</style>
