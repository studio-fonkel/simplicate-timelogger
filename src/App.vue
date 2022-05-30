<template>
  <APIKeyPrompt v-if="credentialsComplete === false"/>

  <template v-else>
    <EmployeePicker/>

    <template v-if="employeePickerVisible === false">
      <HoursOverview
        :currentlyEditedHoursEntry="currentlyEditedHoursEntry"
        @edit-hours-entry="editHoursEntry"
      />

      <TimerForm
        :mode="timerFormMode"
        :currentlyEditedHoursEntry="currentlyEditedHoursEntry"
        @confirm-edit-hours-entry="confirmEditHoursEntry"
        @cancel-edit-hours-entry="cancelEditHoursEntry"
      />
    </template>
  </template>
</template>

<script setup>
  import { ref } from 'vue';
  import { employeePickerVisible } from './composables/use-employees';
  import APIKeyPrompt from './components/APIKeyPrompt.vue';
  import EmployeePicker from './components/EmployeePicker.vue';
  import HoursOverview from './components/HoursOverview.vue';
  import TimerForm from './components/TimerForm.vue';
  import { credentialsComplete } from './composables/use-axios.js';

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
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    height: 100%;
    min-height: 100%;
  }

  body {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    font-size: 1.2rem;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $black-1;
    display: flex;
    justify-content: stretch;
    align-items: stretch;
    margin: 0;
    padding: 0;
    min-height: 100%;
    background-color: hsl(30deg 13% 98.5%);
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

  // .full-width {
  //   width: 100%;
  // }

  #app {
    padding: 120px 60px 60px;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    justify-content: space-around;
    align-items: flex-start;
    gap: 40px;
    max-width: 1600px;
    min-height: 100%;
    margin: 0 auto;

    .hours-overview {
      flex: 1 0 60%;
      min-width: 650px;
      max-width: 980px;
    }

    .timer-form {
      flex: 0 0 auto;
      width: 400px;
    }
  }

  h3 {
    line-height: 1.6;
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
      &.fa,
      &.fab,
      &.fad,
      &.fal,
      &.far,
      &.fas {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .btn--small {
    padding: 0.6em;

    > i {
      &.fa,
      &.fab,
      &.fad,
      &.fal,
      &.far,
      &.fas {
        width: 1em;
      }
    }

    + .btn--small {
      margin-left: 0.65ch;
    }
  }

  .btn--small-with-text {
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.65ch;
    line-height: 1;
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

  .btn--red {
    // Background
    --button-normal-default-background-color-1: #{$red-7};
    --button-normal-default-background-color-2: #{$red-6};
    --button-normal-hover-background-color-1: #{$red-5};
    --button-normal-hover-background-color-2: #{$red-4};
    --button-normal-active-background-color-1: #{$red-3};
    --button-normal-active-background-color-2: #{$red-2};
    --button-disabled-background-color-1: #{$grey-7};
    --button-disabled-background-color-2: #{$grey-7};
    // Text + shadow
    --button-normal-text-color: #{$white-0};
    --button-disabled-text-color: #{$white-0};
    --button-normal-text-shadow-color: #{$red-4};
    --button-disabled-text-shadow-color: #{$grey-6};
    // Borders
    --button-normal-default-border-color: #{$red-5};
    --button-normal-hover-border-color: #{$red-4};
    --button-normal-active-border-color: #{$red-2};
    // Box-shadow
    --button-normal-box-shadow-color: #{rgba($red-1, 0.3)};
    --button-disabled-box-shadow-color: #{rgba(#585858, 0.15)};
  }

  .btn--blue {
    // Background
    --button-normal-default-background-color-1: #{$blue-7};
    --button-normal-default-background-color-2: #{$blue-6};
    --button-normal-hover-background-color-1: #{$blue-5};
    --button-normal-hover-background-color-2: #{$blue-4};
    --button-normal-active-background-color-1: #{$blue-3};
    --button-normal-active-background-color-2: #{$blue-2};
    --button-disabled-background-color-1: #{$grey-7};
    --button-disabled-background-color-2: #{$grey-7};
    // Text + shadow
    --button-normal-text-color: #{$white-0};
    --button-disabled-text-color: #{$white-0};
    --button-normal-text-shadow-color: #{$blue-4};
    --button-disabled-text-shadow-color: #{$grey-6};
    // Borders
    --button-normal-default-border-color: #{$blue-5};
    --button-normal-hover-border-color: #{$blue-4};
    --button-normal-active-border-color: #{$blue-2};
    // Box-shadow
    --button-normal-box-shadow-color: #{rgba($blue-1, 0.3)};
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

  label {
    margin: 0 0 0.5em;
    font-size: 70%;
    font-weight: 700;
  }

  input, textarea {
    appearance: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: auto;
    max-width: 100%;
    padding: 0.9em 0.75em 0.8em;
    border: 1px solid $grey-7;
    font-size: inherit;
    font-family: inherit;
    font-weight: 500;
    color: inherit;
    border-radius: 5px;
  }

  input {
    line-height: 1;
  }

  textarea {
    width: 100%;
    resize: vertical;
    line-height: 1.4;
  }

  // Tags: wrapper of placeholder/input/single.
  // Placeholder: input placeholder when no option is selected.
  // Single: label of currently selected option.
  // Input: input has focus and you can type.
  // Content wrapper: wrapper of dropdown list.
  // Option: an option in the dropdown list.

  .multiselect {
    cursor: pointer;
    color: inherit;
    --multiselect-spinner-border-width: 2px;
    --multiselect-select-width: 2.3em;
    --multiselect-select-border-width: 0.32em;

    &:hover,
    &:focus-within {
      .multiselect__tags {
        background: linear-gradient(to bottom, #fdfdfd, #f5f5f5);
      }
    }
  }

  .multiselect,
  .multiselect__tags,
  .multiselect__tags * {
    font-size: inherit;
    line-height: 1;
  }

  .multiselect__tags {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: auto;
    padding: 0.9em var(--multiselect-select-width) 0.8em 0.75em;
    border: 1px solid $grey-7;
  }

  %ellipsis {
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    // REVIEW: Check if ellipsis works without overflow: hidden, because text was being cut off.
    overflow: visible;
    // overflow: hidden;
  }

  .multiselect__placeholder,
  .multiselect__single,
  .multiselect__input {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    height: 1.2em;
    min-height: auto;
    vertical-align: initial;
    padding: 0 !important;
    margin: 0 !important;
    background: none;
    border-radius: 0 !important;
    @extend %ellipsis;
  }

  .multiselect__input {
    // transform: translateY(-1px);
  }

  .multiselect__single,
  .multiselect__option {
    font-weight: 500;
  }

  .multiselect__spinner {
    flex: 0 0 auto;
    order: 5;
    display: block;
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    width: 2em;
    height: 100%;
    background: none;

    &::before,
    &::after {
      top: calc(50% - var(--multiselect-spinner-border-width));
      border-width: var(--multiselect-spinner-border-width);
    }

    &.multiselect__loading-leave-active {
      transition-duration: 0.15s;
    }
  }

  .multiselect__select {
    flex: 0 0 auto;
    order: 6;
    display: block;
    padding: 0.2em 0.4em;
    top: 0;
    right: 0;
    width: var(--multiselect-select-width);
    height: 100%;
    background: none;
    transition: none;

    &::before {
      display: inline-block;
      margin-top: 0;
      top: 50%;
      transform: translateY(-145%);
      // top: calc(50% + 0.35em);
      color: $grey-5;
      border-color: $grey-5 transparent transparent transparent;
      border-width: var(--multiselect-select-border-width) var(--multiselect-select-border-width) 0 var(--multiselect-select-border-width);
    }
  }

  .multiselect__content-wrapper {
    box-shadow: 0 3px 12px -8px $grey-6;
  }

  .multiselect__content {
    margin: 8px 0;
  }

  .multiselect__option {
    min-height: auto;
    box-sizing: content-box;
    display: flex;
    align-items: center;
    padding: 0.97em 0 0.86em;
    line-height: inherit;
    font-size: 0.8em;
    transition-property: background-color, color;
    transition-duration: 0.06s;
    transition-timing-function: ease-out;
    @extend %ellipsis;

    &--highlight {
      background-color: $blue-9 !important;
      color: $white-0 !important;
    }

    &--selected {
      font-weight: 700 !important;
      background-color: lighten($blue-9, 50%);
    }

    span {
      line-height: 1;
      padding-left: 1em;
      padding-right: 1em;
    }
  }
</style>
