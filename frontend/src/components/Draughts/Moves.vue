<script lang="ts">
import {defineComponent} from 'vue'
import AcceptOrDenyCommand from "@/components/Draughts/AcceptOrDenyCommand.vue";
import {useGameStore} from "@/store";
import {PermissionRequest} from "@/globals.ts";

export default defineComponent({
  name: "Moves",
  components: {AcceptOrDenyCommand},
  computed:{
    PermissionRequest() {
      return PermissionRequest
    },
    permissionRequested(): PermissionRequest{
      const gameStore = useGameStore();
      return gameStore.currentGame?._permissionRequest ?? PermissionRequest.Nothing
    }
  }
})
</script>

<template>
<div
  style="height: 100%;"
>
  <accept-or-deny-command
    v-if="permissionRequested !== PermissionRequest.Nothing && permissionRequested !== PermissionRequest.Exit"
    v-bind:request="permissionRequested"
  />
</div>

</template>

<style scoped lang="scss">

</style>