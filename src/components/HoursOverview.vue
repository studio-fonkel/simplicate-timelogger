<template>
  <main class="hours-overview">
    <DateBrowser/>

    <table>
      <thead>
        <tr>
          <th class="hours-overview__col--start-end-time">Start-/eindtijd</th>
          <th class="hours-overview__col--project">Project</th>
          <th class="hours-overview__col--hours-amount">Aantal uren</th>
          <th class="hours-overview__col--actions"></th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-if="initiallyLoadedEmployeeHours === false"
          class="hours-overview__empty-row"
        >
          <td colspan="4">
            <i class="fas fa-sync-alt fa-spin"></i>
            <div>Uren ophalen</div>
          </td>
        </tr>

        <tr
          v-else-if="sortedHoursAndTimers.length === 0"
          class="hours-overview__empty-row"
        >
          <td colspan="4">
            <i class="fas fa-receipt"></i>
            <div>Geen uren gevonden</div>
          </td>
        </tr>

        <template v-else>
          <tr
            v-for="entry of sortedHoursAndTimers"
            :key="entry.id"
            class="hours-entry"
          >
            <td class="hours-overview__col--start-end-time">
              <div v-if="entry._entry_type === 'hours' && entry.is_time_defined === false" class="semi-dim">
                Geen start-/eindtijd ingesteld
              </div>
              <div v-else>
                <div><strong>{{ toTimeString(getEntryStartDateTime(entry).toString()) }}</strong></div>
                <div v-if="entry._entry_type === 'hours' && 'end_date' in entry">
                  {{ toTimeString(entry.end_date) }}
                </div>
              </div>
            </td>

            <td class="hours-overview__col--project">
              <div><strong>{{ entry.project.organization.name }} – {{ entry.project.name }}</strong></div>
              <div>{{ entry.projectservice.name }} (<i class="fas fa-stopwatch"></i> {{ getHoursTypeProperty(entry).label }})</div>
              <div
                v-if="(entry._entry_type === 'hours' && entry.note)
                  || (entry._entry_type === 'timer' && entry.description)"
                class="hours-entry__description semi-dim"
              >
                <i class="fas fa-quote-left"></i>{{ getDescriptionProperty(entry) || '-' }}
              </div>
            </td>

            <td class="hours-overview__col--hours-amount">
              <strong v-if="entry._entry_type === 'hours'">
                {{ toDurationString(entry.hours) }}
              </strong>
              <strong v-else-if="entry._entry_type === 'timer'">
                {{ toDurationString(entry.seconds_spent / 3600) }}
              </strong>
            </td>

            <td class="hours-overview__col--actions">
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
                <!-- <i class="fas fa-stop"></i> -->
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
                @click="(event) => {
                  if (entry._entry_type === 'hours') {
                    confirmDeleteHours(entry.id, event.target);
                  }
                  else if (entry._entry_type === 'timer') {
                    confirmDeleteTimer(entry.id, event.target);
                  }
                }"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </template>

        <tr class="hours-overview__totals">
          <td colspan="3" class="hours-overview__col--hours-total">
            <strong><i class="far fa-clock"></i>&nbsp;&nbsp;Totaal:&nbsp;&nbsp;&nbsp;{{ totalHoursDurationString }}</strong>
          </td>
          <td></td>
        </tr>
      </tbody>
    </table>
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
      description: hoursEntry.note,
    });

    console.log(res); // TODO: Finish

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

  function confirmDeleteHours (hoursID, buttonElement) {
    const res = window.confirm('Weet je zeker dat je deze uren wilt verwijderen?');
    if (res === true) {
      buttonElement.closest('tr').classList.add('hours-entry--deleting');
      deleteHours(hoursID);
    }
  }

  function confirmDeleteTimer (timerID, buttonElement) {
    const res = window.confirm('Weet je zeker dat je deze timer wilt verwijderen?');
    if (res === true) {
      buttonElement.closest('tr').classList.add('hours-entry--deleting');
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

    table {
      width: 100%;
      text-align: left;
      border-spacing: 0;
      box-shadow: 0 3px 20px -3px rgba(#585858, 0.06);
      table-layout: fixed;
      $th-border-color: lighten($grey-7, 3%);
      $accent-color-hue: 40;

      th {
        &.hours-overview__col--start-end-time {
          width: 18ch;
        }
        &.hours-overview__col--project {
          width: auto;
        }
        &.hours-overview__col--hours-amount {
          width: 16ch;
        }
        &.hours-overview__col--actions {
          width: 23ch;
        }
      }

      th, td {
        border: 1px solid $grey-7;
        min-width: 10ch;

        &:not(:first-child) {
          border-left-width: 0;
        }
        &:not(:last-child) {
          border-right-width: 0;
        }
        &:first-child {
          padding-left: 1.1em;
        }
        &:last-child {
          padding-right: 1.4em;
        }

        &.hours-overview__col--hours-amount,
        &.hours-overview__col--actions,
        &.hours-overview__col--hours-total {
          text-align: right;
        }
      }

      th {
        padding: 1.12em 0.85em 0.8em;
        $th-bg-color: hsl($accent-color-hue, 15%, 96%);
        background: linear-gradient(to bottom, $th-bg-color, darken($th-bg-color, 2%));
        border-color: $th-border-color;
        color: hsl($accent-color-hue, 3%, 25%);
        font-weight: 900;

        &:first-child {
          border-top-left-radius: 8px;
        }
        &:last-child {
          border-top-right-radius: 8px;
        }
      }

      td {
        padding: 0.9em 0.85em 0.86em;
        background-color: $white-0;

        &.hours-overview__col--start-end-time {
          vertical-align: top;
        }
        &.hours-overview__col--hours-amount {
          font-size: math.div(1em, 0.8);
        }
      }

      tbody tr:first-child td {
        border-top-color: $th-border-color;
      }

      th,
      tbody tr:not(:last-child) td {
        border-bottom-width: 0;
      }

      tr:not(.hours-overview__totals) {
        font-size: 0.8em;
        line-height: 1.5;
      }

      .hours-entry__description {
        margin-top: 0.3em;
        line-height: 1.26;

        .fa-quote-left {
          display: none;
          // display: inline-block;
          // margin-right: 0.4ch;
          // font-size: 42%;
          // vertical-align: text-top;
          // transform: translateY(50%);
          // color: $grey-7;
        }
      }

      tr.hours-overview__empty-row td {
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

      tr.hours-overview__totals td {
        padding-top: 1.4em;
        padding-bottom: 1.4em;
        background-color: hsl($accent-color-hue, 20%, 95.5%);

        &:first-child {
          border-bottom-left-radius: 8px;
        }
        &:last-child {
          border-bottom-right-radius: 8px;
        }
      }

      tr.hours-entry--deleting td > * {
        opacity: 0.3;
        pointer-events: none;
      }
    }
  }
</style>
