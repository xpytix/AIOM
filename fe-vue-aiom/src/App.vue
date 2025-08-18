<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style>
/* Tutaj możesz dodać globalne style, które będą działać w całej aplikacji */
/* Na przykład resetowanie marginesów, style dla body itp. */
body {
  margin: 0;
  font-family: sans-serif;
  background-color: #f0f2f5;
}
</style>