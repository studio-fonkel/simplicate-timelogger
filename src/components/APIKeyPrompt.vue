<template>
  <div class="api-key-prompt">
    <div class="left">
      <img src="/unlock.svg"/>
    </div>
    <div class="right">
      <h3>Log in met je Simplicate API key en secret om te beginnen</h3>
      <form @submit.prevent="saveCredentials">
        <label for="api_key">API key</label>
        <input type="password" autocomplete="off" id="api_key" v-model="apiKey"/>
        <label for="api_secret">API secret</label>
        <input type="password" autocomplete="off" id="api_secret" v-model="apiSecret"/>
        <button type="submit" class="btn--green">Opslaan</button>
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
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 80px;

    .left {
      width: 240px;
    }

    .right {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      height: 100%;
      width: 580px;
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
  }
</style>
