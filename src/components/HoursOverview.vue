<template>
  <main class="hours-overview">
    <DateBrowser/>

    <div class="grid">
      <div class="grid__row--first grid__col--first justify-start">Start-/eindtijd</div>
      <div class="grid__row--first justify-start">Project</div>
      <div class="grid__row--first justify-end">Aantal uren</div>
      <div class="grid__row--first grid__col--last justify-end"></div>

      <template v-if="initiallyLoadedEmployeeHours === false">
        <div class="grid__col--all grid__cell--empty justify-center align-center">
          <i class="fas fa-sync-alt fa-spin"></i>
          <div>Uren ophalen</div>
        </div>
      </template>

      <template v-else-if="sortedHoursAndTimers.length === 0">
        <div class="grid__col--all grid__cell--empty justify-center align-center">
          <i class="fas fa-receipt"></i>
          <div>Geen uren gevonden</div>
        </div>
      </template>

      <template v-else>
        <template
          v-for="(entry, i) of sortedHoursAndTimers"
          :key="entry.id"
        >
          <div
            class="grid__col--first grid__cell--start-end-time justify-start"
            :data-entry-id="entry.id"
            :data-nth-entry="i + 1"
          >
            <div v-if="entry._entry_type === 'hours' && entry.is_time_defined === false" class="semi-dim">
              Geen start-/eindtijd ingesteld
            </div>
            <div v-else>
              <div><strong>{{ toTimeString(getEntryStartDateTime(entry).toString()) }}</strong></div>
              <div v-if="entry._entry_type === 'hours' && 'end_date' in entry">
                {{ toTimeString(entry.end_date) }}
              </div>
            </div>
          </div>

          <div
            class="grid__cell--project justify-start"
            :data-entry-id="entry.id"
            :data-nth-entry="i + 1"
          >
            <div>
              <div><strong>{{ entry.project.organization.name }} – {{ entry.project.name }}</strong></div>
              <div>{{ entry.projectservice.name }} (<i class="fas fa-stopwatch"></i> {{ getHoursTypeProperty(entry).label }})</div>
              <div
                v-if="getDescriptionProperty(entry)"
                class="grid__cell--project__description semi-dim"
              >
                {{ getDescriptionProperty(entry) || '-' }}
              </div>
            </div>
          </div>

          <div
            class="grid__cell--hours-amount justify-end align-center"
            :data-entry-id="entry.id"
            :data-nth-entry="i + 1"
          >
            <strong v-if="entry._entry_type === 'hours'">
              {{ toDurationString(entry.hours) }}
            </strong>
            <strong v-else-if="entry._entry_type === 'timer'">
              {{ toDurationString(entry.seconds_spent / 3600) }}
            </strong>
          </div>

          <div
            class="grid__col--last grid__cell--actions justify-end align-center"
            :data-entry-id="entry.id"
            :data-nth-entry="i + 1"
          >
            <button
              type="button"
              class="btn--small btn--small-with-text"
              :class="entry._entry_type === 'timer' ? 'btn--blue' : 'btn--grey'"
              :title="entry._entry_type === 'timer' ? 'Stop timer' : 'Start timer'"
              @click="() => {
                if (entry._entry_type === 'hours') {
                  doCreateTimerFromHours(entry);
                }
                else if (entry._entry_type === 'timer') {
                  stopTimer(entry.id);
                }
              }"
            >
              <template v-if="entry._entry_type === 'timer'">
                <i class="fas fa-stopwatch"></i> Stop
              </template>
              <template v-else>
                <i class="fas fa-play"></i> Start
              </template>
            </button>

            <button
              type="button"
              class="btn--small"
              :class="currentlyEditedHoursEntry?.id === entry.id ? 'btn--blue' : 'btn--grey'"
              title="Bewerk log"
              @click="$emit('edit-hours-entry', entry)"
            >
              <i class="fas fa-pencil-alt"></i>
            </button>

            <button
              type="button"
              class="btn--small btn--red"
              title="Verwijder log"
              @click="() => {
                if (entry._entry_type === 'hours') {
                  confirmDeleteHours(entry.id);
                }
                else if (entry._entry_type === 'timer') {
                  confirmDeleteTimer(entry.id);
                }
              }"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </template>
      </template>

      <div class="grid__row--last grid__col grid__col--first grid__cell--hours-total justify-end">
        <strong><i class="far fa-clock"></i>&nbsp;&nbsp;Totaal:&nbsp;&nbsp;&nbsp;{{ totalHoursDurationString }}</strong>
      </div>
      <div class="grid__row--last grid__col grid__col--last grid__cell--hours-total-extra-col justify-end">
      </div>
    </div>
  </main>
</template>

<script setup>
  import { computed, watch, watchEffect, onMounted, onBeforeUnmount } from 'vue';

  import {
    hours,
    initiallyLoadedEmployeeHours,
    fetchHours,
    deleteHours,
    startPollingFetchHours,
    stopPollingFetchHours,
  } from '../composables/use-hours.js';

  import {
    timers,
    creatingTimer,
    calculateStartDateTimeFromSecondsSpent,
    fetchTimers,
    createTimer,
    deleteTimer,
    stopTimer,
    startPollingFetchTimers,
    stopPollingFetchTimers,
  } from '../composables/use-timer.js';

  import {
    toPlainDateTime,
    toTimeString,
    toDurationString,
    compareDateTimes,
    getCurrentTime,
  } from '../composables/use-date-helper.js';

  import { currentEmployeeID } from '../composables/use-employees.js';

  import DateBrowser from './DateBrowser.vue';

  defineProps({
    // TODO: We're only temporarily using a prop for this. Move somewhere else later.
    currentlyEditedHoursEntry: {
      type: [Object, null],
      required: true,
    },
  });

  defineEmits({
    'edit-hours-entry': hoursEntry => hoursEntry != null,
  });

  watchEffect(() => {
    const currentlyRunningTimers = timers.value.filter(timer => timer.state === 'running');
    if (currentlyRunningTimers.length > 1) {
      console.warn('Multiple timers running!', currentlyRunningTimers);
    }
  });

  const sortedHoursAndTimers = computed(() => {
    const hoursAndTimers = [
      ...hours.value.map(entry => ({ _entry_type: 'hours', ...entry })),
      ...timers.value.map(entry => ({ _entry_type: 'timer', ...entry })),
    ];

    return hoursAndTimers.sort((a, b) => {
      if (a._entry_type === 'timer' && a.is_time_defined === false) {
        return -1;
      }

      const dateA = getEntryStartDateTime(a);
      const dateB = getEntryStartDateTime(b);
      const res = compareDateTimes(dateA, dateB);
      return res;
    });
  });

  const totalHours = computed(() => {
    return hours.value.reduce((total, curr) => total + curr.hours, 0);
  });

  const totalHoursDurationString = computed(() => {
    return toDurationString(totalHours.value);
  });

  async function doCreateTimerFromHours (hoursEntry) {
    creatingTimer.value = true;

    const res = await createTimer({
      projectId: hoursEntry.project.id,
      projectServiceId: hoursEntry.projectservice.id,
      projectServiceHoursTypeId: hoursEntry.type.id,
      startTime: getCurrentTime(),
      description: hoursEntry.note,
    });

    console.log(res); // TODO: Finish!

    creatingTimer.value = false;
  }


  function getEntryStartDateTime (entry) {
    switch (entry._entry_type) {
      case 'hours':
        return toPlainDateTime(entry.start_date);
      case 'timer':
        return calculateStartDateTimeFromSecondsSpent(entry.seconds_spent);
    }
  }

  function getHoursTypeProperty (entry) {
    switch (entry._entry_type) {
      case 'hours':
        return entry.type;
      case 'timer':
        return entry.hourstype;
    }
  }

  function getDescriptionProperty (entry) {
    switch (entry._entry_type) {
      case 'hours':
        return entry.note;
      case 'timer':
        return entry.description;
    }
  }

  function markIsDeleting (entryID) {
    for (const gridCell of document.querySelectorAll(`[data-entry-id="${entryID}"]`)) {
      gridCell.classList.add('grid__cell--is-deleting');
    }
  }

  function confirmDeleteHours (hoursID) {
    const res = window.confirm('Weet je zeker dat je deze uren wilt verwijderen?');
    if (res === true) {
      markIsDeleting(hoursID);
      deleteHours(hoursID);
    }
  }

  function confirmDeleteTimer (timerID) {
    const res = window.confirm('Weet je zeker dat je deze timer wilt verwijderen?');
    if (res === true) {
      markIsDeleting(timerID);
      deleteTimer(timerID);
    }
  }

  // When the current employee ID changes, re-fetch hours, so we can display the new current employee's hours.
  watch(currentEmployeeID, (employeeID) => {
    if (employeeID != null) {
      initiallyLoadedEmployeeHours.value = false;
      fetchHours();
      fetchTimers();
    }
  });

  onMounted(() => {
    // On init, fetch all hours and start polling.
    fetchHours();
    startPollingFetchHours();

    // On init, fetch all timers and start polling.
    fetchTimers();
    startPollingFetchTimers();
  });

  onBeforeUnmount(() => {
    stopPollingFetchHours();
    stopPollingFetchTimers();
  });
</script>

<style lang="scss">
  .hours-overview {
    .date-browser {
      margin-bottom: 1em;
    }

    .grid {
      width: 100%;
      overflow-x: auto;
      display: grid;
      grid-template-columns: max-content minmax(20ch, 1fr) max-content minmax(10ch, max-content);
      text-align: left;
      box-shadow: 0 3px 20px -3px rgba(#585858, 0.06);
      $th-border-color: lighten($grey-7, 3%);
      $accent-color-hue: 40;

      > * {
        display: flex;
        flex-flow: row wrap;
        border: 1px solid $grey-7;

        &:not(.grid__col--first, .grid__col--all) {
          border-left-width: 0;
        }

        &:not(.grid__col--last, .grid__col--all) {
          border-right-width: 0;
        }

        &:not(.grid__row--last) {
          border-bottom-width: 0;
        }

        // Table header
        &.grid__row--first {
          padding: 1.12em 0.85em 0.8em;
          $th-bg-color: hsl($accent-color-hue, 15%, 96%);
          background: linear-gradient(to bottom, $th-bg-color, darken($th-bg-color, 2%));
          border-color: $th-border-color;
          color: hsl($accent-color-hue, 3%, 25%);
          font-weight: 900;

          &.grid__col--first {
            border-top-left-radius: 8px;
          }
          &.grid__col--last {
            border-top-right-radius: 8px;
          }
        }

        &.grid__row--last {
          &.grid__col--first {
            border-bottom-left-radius: 8px;
          }
          &.grid__col--last {
            border-bottom-right-radius: 8px;
          }
        }

        // Table cells
        &:not(.grid__row--first) {
          padding: 0.9em 0.85em 0.86em;
          background-color: $white-0;
        }

        &.grid__col--first,
        &.grid__col--all {
          padding-left: 1.1em;
        }

        &.grid__col--last,
        &.grid__col--all {
          padding-right: 1.4em;
        }

        &.grid__col--all {
          grid-column: 1 / -1;
        }

        // EXCEPTION:
        // All exceptions to the rules above are below this point.

        &:not(.grid__cell--hours-total, .grid__cell--hours-amount) {
          font-size: 0.8em;
          line-height: 1.5;
        }

        &.grid__cell--hours-total,
        &.grid__cell--hours-total-extra-col {
          padding-top: 1.4em;
          padding-bottom: 1.4em;
          background-color: hsl($accent-color-hue, 20%, 95.5%);
        }

        &.grid__cell--hours-total {
          grid-column: 1 / -2;
        }

        &.grid__cell--hours-total-extra-col {
          grid-column: -2 / -1;
        }

        &.grid__cell--project {
          &__description {
            margin-top: 0.3em;
            line-height: 1.26;
          }
        }

        &.grid__cell--actions {
          align-content: center;
          gap: 6px;

          button {
            margin: 0;
          }
        }

        &.grid__cell--empty {
          flex-flow: column nowrap;
          row-gap: 2px;
          text-align: center;
          color: $grey-7;
          padding: 4em 2.15em 3.8em;

          i {
            font-size: 250%;
            transform-origin: 50.05% 48.8% !important;
            animation-duration: 1s;
          }

          div {
            font-size: 150%;
          }
        }

        &.grid__cell--is-deleting {
          pointer-events: none;

          > * {
            opacity: 0.3;
          }
        }

        &[data-nth-entry="1"] {
          border-top-color: $th-border-color;
        }
      }
    }
  }
</style>
