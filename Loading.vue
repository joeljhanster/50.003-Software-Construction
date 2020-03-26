<template>
  <div class="load">
    <v-progress-circular
      :rotate="-90"
      :size="200"
      :width="15"
      :value="value"
      color="teal"
      indeterminate
    >{{ value }}</v-progress-circular>
  </div>
</template>

<script>
export default {
  data() {
    return {
      interval: {},
      value: 0
    };
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  mounted() {
    this.interval = setInterval(() => {
      if (this.value === 100) {
        return (this.value = 0);
      }
      this.value += 10;
    }, 1000);
  }
};
</script>

<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>
