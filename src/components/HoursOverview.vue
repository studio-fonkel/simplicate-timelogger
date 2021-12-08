<template>
  <table class="hours-overview">
    <thead>
      <tr>
        <th><i class="far fa-clock"></i> Start-/eindtijd</th>
        <th>Project</th>
        <th>Aantal uren</th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="hoursEntry of sortedHours"
        :key="hoursEntry.id"
        class="hours-entry"
      >
        <td>
          <span v-if="hoursEntry.is_time_defined === false" class="semi-dim">
            Geen start-/eindtijd
          </span>
          <span v-else>
            <div><strong>{{ toTimeString(hoursEntry.start_date) }}</strong></div>
            <div>{{ toTimeString(hoursEntry.end_date) }}</div>
          </span>
        </td>

        <td>
          <div><strong>{{ hoursEntry.project.name }}</strong></div>
          <div>{{ hoursEntry.projectservice.name }}</div>
          <div v-if="hoursEntry.note" class="hours-entry__description semi-dim">{{ hoursEntry.note || '-' }}</div>
        </td>

        <td>
          <strong>{{ toDurationString(hoursEntry.hours) }}</strong>
          <button
            type="button"
            class="hours-entry__edit-btn btn--small btn--grey"
            title="Bewerk log"
            @click="$emit('edit-hours-entry', hoursEntry)"
          >
            <i class="fas fa-pencil-alt"></i>
          </button>
        </td>
      </tr>

      <tr class="hours-overview__totals">
        <td colspan="3"><strong>Totaal:&nbsp;&nbsp;&nbsp;{{ totalHoursDurationString }}</strong></td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
  import { ref, computed } from 'vue';

  import {
    hours,
    fetchHours,
    startPolling,
  } from '../composables/use-hours.js';

  defineEmits({
    'edit-hours-entry': hoursEntry => hoursEntry != null,
  });

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
  startPolling();
</script>

<style lang="scss">
  .hours-overview {
    text-align: left;
    border-spacing: 0;
    box-shadow: 0 3px 20px -3px rgba(#585858, 0.06);
    table-layout: fixed;

    // Set first column width to fixed width
    th:first-child {
      width: 17.5ch;
    }
    // Set last column to minimal width
    th:last-child {
      width: 0;
    }

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
      $th-bg-color: hsl(25, 7%, 87.5%);
      color: hsl(25, 3%, 40%);
      font-weight: 900;
      background-color: $th-bg-color;
      border-color: $th-bg-color;
      padding: 1.12em 0.85em 0.8em;

      &:first-child {
        border-top-left-radius: 8px;
      }
      &:last-child {
        border-top-right-radius: 8px;
      }
    }

    th,
    tbody tr:not(.hours-overview__totals) td {
      border-bottom-width: 0;
    }

    tr:not(.hours-overview__totals) {
      font-size: 0.8em;
      line-height: 1.55;
    }

    .hours-entry__description {
      margin-top: 0.23em;

      // @if (true) {
      //   &::before {
      //     content: "“";
      //     opacity: 0.5;
      //   }
      //   &::after {
      //     content: "”";
      //     opacity: 0.5;
      //   }
      // }
      // @else {
      //   &::before {
      //     content: "\25B6\0020";
      //     display: inline-block;
      //     white-space: pre;
      //     transform: scale(0.6);
      //     margin-right: -0.4ch;
      //     transform-origin: left center;
      //     opacity: 0.3;
      //   }
      // }
    }

    tr.hours-overview__totals td {
      padding-top: 1.4em;
      padding-bottom: 1.4em;
      background-color: hsl(25, 26%, 95%);

      &:first-child {
        border-bottom-left-radius: 8px;
      }
      &:last-child {
        border-bottom-right-radius: 8px;
      }
    }

    .hours-entry__edit-btn {
      margin-left: 0.75em;
    }
  }
</style>
