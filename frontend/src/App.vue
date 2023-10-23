
<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  components: {
  },
  created(){
  },
  beforeMount()
  {

  }

})
</script>


<template>
  <v-toolbar
    :title="$t('draughts-title')"
    density="comfortable"
  >
  </v-toolbar>
  <router-view />
</template>

<style lang="scss" scoped>
</style>
