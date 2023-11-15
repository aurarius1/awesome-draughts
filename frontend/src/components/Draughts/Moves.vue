<script lang="ts">
import {defineComponent} from 'vue'
import AcceptOrDenyCommand from "@/components/Draughts/AcceptOrDenyCommand.vue";
import {useGameStore} from "@/store";

export default defineComponent({
  name: "Moves",
  components: {AcceptOrDenyCommand},
  computed:{
    permissionRequested(){
      const gameStore = useGameStore();
      return gameStore._currentApiGame?._permissionRequest ?? 0;
    }
  }
})
</script>

<template>
<div
  style="height: 100%;"
>
  <accept-or-deny-command
    v-if="permissionRequested !== 0 && permissionRequested !== 4"
    :request="permissionRequested"
  />
</div>

</template>

<style scoped lang="scss">

</style>