<template>
  <div class="api-key-prompt">
    <div class="left">
      <img src="/unlock.svg"/>
    </div>
    <div class="right">
      <h3>Log in met je Simplicate API key en secret om te beginnen</h3>
      <form @submit.prevent="saveCredentials">
        <label for="api_key">API key</label>
        <input
          id="api_key"
          v-model="apiKey"
          type="password"
          autocomplete="off"
        />
        <label for="api_secret">API secret</label>
        <input
          id="api_secret"
          v-model="apiSecret"
          type="password"
          autocomplete="off"
        />
        <button type="submit" class="btn--green">Log in</button>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { saveApiKey, saveApiSecret } from '../composables/use-axios.js';

  const apiKey = ref('');
  const apiSecret = ref('');

  const saveCredentials = () => {
    saveApiKey(apiKey.value);
    saveApiSecret(apiSecret.value);
    window.location.reload();
  };
</script>

<style lang="scss">
  .api-key-prompt {
    max-width: 100%;
    min-height: 100%;
    margin-top: $page-padding - $page-padding-top;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    $left-width: 240px;
    $right-width: 520px;
    $col-gap: 100px;
    column-gap: $col-gap;
    row-gap: 40px;

    .left {
      flex: 1 0 auto;
      width: $left-width;
      text-align: center;

      @media screen and (max-width: #{$left-width + $right-width + $col-gap + 2 * $page-padding - 1px}) {
        img {
          max-height: 25vh;
        }
      }
    }

    .right {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      height: 100%;
      width: $right-width;
    }

    h3 {
      margin-top: 0;
    }

    form {
      margin-top: 0.3em;
      font-size: 115%;
    }

    label {
      display: inline-block;

      &:not(:first-child) {
        margin-top: 1.5em;
      }
    }

    input {
      width: 100%;
    }

    button {
      margin-top: 1.25em;
    }
  }
</style>
