<template>
  <table class="hours-overview">
    <thead>
      <tr>
        <th>Start time</th>
        <th>Project</th>
        <th>Aantal uren</th>
        <!-- <th>Total</th> -->
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="hoursEntry of sortedHours"
        :key="hoursEntry.id"
      >
        <td>
          <span v-if="hoursEntry.is_time_defined === false" class="semi-dim">
            Geen starttijd
          </span>
          <span v-else>
            {{ toTimeString(hoursEntry.start_date) }}
          </span>
        </td>
        <td>
          <div><strong>{{ hoursEntry.project.name }}</strong></div>
          <div>{{ hoursEntry.projectservice.name }}</div>
          <div v-if="hoursEntry.note" class="semi-dim">{{ hoursEntry.note }}</div>
        </td>
        <td>{{ toDurationString(hoursEntry.hours) }}</td>
      </tr>
      <tr class="totals">
        <td colspan="3">Totaal:&nbsp;&nbsp;&nbsp;{{ totalHoursDurationString }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
  import { ref, computed } from 'vue';

  import {
    hours,
    fetchHours,
  } from '../composables/use-hours.js';

  const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
    hour: 'numeric',
    minute: 'numeric',
  });

  const toTimeString = (value) => {
    const dateTime = new Date(value);
    return timeFormatter.format(dateTime);
  };

  const toDurationString = (value) => {
    const h = Math.trunc(value);
    const mm = Math.floor((value - h) * 60);
    return `${h}:${mm < 10 ? '0' : ''}${mm}`;
  };

  const sortedHours = computed(() => {
    const hoursClone = ref(hours.value.slice());
    return hoursClone.value.sort((a, b) => {
      if (a.is_time_defined === false) {
        return -1;
      }

      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      const res = Math.sign(dateA - dateB);
      return res;
    });
  });

  const totalHours = computed(() => {
    return hours.value.reduce((total, curr) => total + curr.hours, 0);
  });

  const totalHoursDurationString = computed(() => {
    return toDurationString(totalHours.value);
  });

  fetchHours();
</script>

<style scoped lang="scss">
  table {
    text-align: left;
    border-spacing: 0;
    font-size: 0.8em;

    th, td {
      border: 1px solid #e7e7e7;
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
        text-align: right;
        padding-right: 1.6em;
      }
    }

    td {
      padding: 0.8em 0.85em 0.76em;

      &:first-child {
        vertical-align: top;
      }
    }

    th {
      $th-bg-color: #d1ccc7;
      background-color: $th-bg-color;
      border-color: $th-bg-color;
      padding: 1em 0.85em 0.8em;

      &:first-child {
        border-top-left-radius: 8px;
      }
      &:last-child {
        border-top-right-radius: 8px;
      }
    }

    th,
    tbody tr:not(.totals) td {
      border-bottom-width: 0;
    }

    tr.totals td {
      padding-top: 1.4em;
      padding-bottom: 1.4em;
      background-color: #f5f1ee;
      font-weight: 700;

      &:first-child {
        border-bottom-left-radius: 8px;
      }
      &:last-child {
        border-bottom-right-radius: 8px;
      }
    }
  }
</style>
