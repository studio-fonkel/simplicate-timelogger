<template>
  <HoursOverview
    @edit-hours-entry="editHoursEntry"
  />

  <TimerForm
    :mode="timerFormMode"
    :currentlyEditedHoursEntry="currentlyEditedHoursEntry"
    @confirm-edit-hours-entry="confirmEditHoursEntry"
    @cancel-edit-hours-entry="cancelEditHoursEntry"
  />
</template>

<script setup>
  import { ref } from 'vue';
  import HoursOverview from './components/HoursOverview.vue';
  import TimerForm from './components/TimerForm.vue';

  const timerFormMode = ref('add');
  const currentlyEditedHoursEntry = ref(null);

  const editHoursEntry = (hoursEntry) => {
    currentlyEditedHoursEntry.value = hoursEntry;
    timerFormMode.value = 'edit';
  };

  const confirmEditHoursEntry = () => {
    timerFormMode.value = 'add';
    currentlyEditedHoursEntry.value = null;
  };

  const cancelEditHoursEntry = () => {
    timerFormMode.value = 'add';
    currentlyEditedHoursEntry.value = null;
  };
</script>

<style lang="scss">
  body {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    font-size: 1.2rem;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $black-1;
    margin: 0;
    padding: 0;
  }

  .dim {
    color: #bbb;
  }

  .semi-dim {
    color: #7e7e7e;
  }

  .error {
    color: #b41200;
  }

  #app {
    padding: 60px 60px;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    justify-content: space-around;
    align-items: flex-start;
    gap: 40px;
    max-width: 1400px;
    margin: 0 auto;

    .hours-overview {
      flex: 2 0 60%;
      min-width: 650px;
      max-width: 850px;
    }

    .timer-form {
      flex: 0 0 400px;
    }
  }

  button {
    appearance: none;
    border: none;
    border-radius: 5px;
    padding: 0.65em 1.25em;
    font-family: inherit;
    font-size: 1em;
    font-weight: 700;
    text-shadow: 0 1px 1px var(--button-text-shadow-color);

    &:not(:disabled) {
      color: var(--button-normal-text-color);
      box-shadow: inset 0 0 0 1px var(--button-border-color), var(--button-box-shadow);
      cursor: pointer;
      transition: background 0.1s ease-out;
      --button-text-shadow-color: var(--button-normal-text-shadow-color);
      --button-box-shadow: 0 2.5px 8px -4px var(--button-normal-box-shadow-color);

      &:not(:hover):not(:focus):not(:active) {
        background: linear-gradient(to bottom, var(--button-normal-default-background-color-1), var(--button-normal-default-background-color-2));
        --button-border-color: var(--button-normal-default-border-color);
      }

      &:hover,
      &:focus {
        background: linear-gradient(to bottom, var(--button-normal-hover-background-color-1), var(--button-normal-hover-background-color-2));
        --button-border-color: var(--button-normal-hover-border-color);
      }

      &:active {
        background: linear-gradient(to bottom, var(--button-normal-active-background-color-1), var(--button-normal-active-background-color-2));
        --button-border-color: var(--button-normal-active-border-color);
      }
    }

    &:disabled {
      color: var(--button-disabled-text-color);
      background: linear-gradient(to bottom, var(--button-disabled-background-color-1), var(--button-disabled-background-color-2));
      box-shadow: 0 2.5px 8px -4px var(--button-disabled-box-shadow-color);
      --button-text-shadow-color: var(--button-disabled-text-shadow-color);
    }

    > i {
      vertical-align: middle;
    }
  }

  .btn--small {
    padding: 0.45em 0.6em;
  }

  .btn--green {
    // Background
    --button-normal-default-background-color-1: #{$green-7};
    --button-normal-default-background-color-2: #{$green-6};
    --button-normal-hover-background-color-1: #{$green-5};
    --button-normal-hover-background-color-2: #{$green-4};
    --button-normal-active-background-color-1: #{$green-3};
    --button-normal-active-background-color-2: #{$green-2};
    --button-disabled-background-color-1: #{$grey-7};
    --button-disabled-background-color-2: #{$grey-7};
    // Text + shadow
    --button-normal-text-color: #{$white-0};
    --button-disabled-text-color: #{$white-0};
    --button-normal-text-shadow-color: #{$green-4};
    --button-disabled-text-shadow-color: #{$grey-6};
    // Borders
    --button-normal-default-border-color: #{$green-5};
    --button-normal-hover-border-color: #{$green-4};
    --button-normal-active-border-color: #{$green-2};
    // Box-shadow
    --button-normal-box-shadow-color: #{rgba($green-1, 0.3)};
    --button-disabled-box-shadow-color: #{rgba(#585858, 0.15)};
  }

  .btn--grey {
    // Background
    --button-normal-default-background-color-1: #{$grey-9};
    --button-normal-default-background-color-2: #{$grey-8};
    --button-normal-hover-background-color-1: #{$grey-8};
    --button-normal-hover-background-color-2: #{$grey-7};
    --button-normal-active-background-color-1: #{$grey-7};
    --button-normal-active-background-color-2: #{$grey-6};
    --button-disabled-background-color-1: #{$grey-8};
    --button-disabled-background-color-2: #{$grey-8};
    // Text + shadow
    --button-normal-text-color: #{$black-1};
    --button-disabled-text-color: #{$grey-5};
    --button-normal-text-shadow-color: #{$grey-8};
    --button-disabled-text-shadow-color: #{$grey-7};
    // Borders
    --button-normal-default-border-color: #{$grey-7};
    --button-normal-hover-border-color: #{$grey-7};
    --button-normal-active-border-color: #{$grey-6};
    // Box-shadow
    --button-normal-box-shadow-color: #{rgba($grey-3, 0.2)};
    --button-disabled-box-shadow-color: #{rgba(#585858, 0.15)};
  }
</style>
