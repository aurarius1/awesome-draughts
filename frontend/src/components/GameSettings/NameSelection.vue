<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {PlayerNames} from "@/draughts";
import SelectionRow from "@/components/GameSettings/SelectionRow.vue";

export default defineComponent({
  name: "NameSelection",
  components: {SelectionRow},
  emits: {
    playerNameChanged(playerType: string, playerName: string){
      return playerType === "white" || playerType === "black";
    }
  },
  setup()
  {
    const colorStore = useColorStore()

    return {colorStore}
  },
  props: {
    defaultNames: {
      type: Object as PropType<PlayerNames>,
      default: {
        "white": "Alice",
        "black": "Bob"
      }
    },
    inGame: {
      type: Boolean,
      default: false,
    }
  },
  methods:
  {
    getColorStore()
    {
      return this.colorStore
    }
  }
})
</script>

<template>
  <selection-row
    player="white"
    :name="this.defaultNames.white"
    class="ml-name-selection"
    @player-name-changed="(playerType: string, playerName: string) => this.$emit('playerNameChanged', playerType, playerName)"
  />
  <selection-row
    player="black"
    :name="this.defaultNames.black"
    class="ml-name-selection"
    @player-name-changed="(playerType: string, playerName: string) => this.$emit('playerNameChanged', playerType, playerName)"
  />

</template>

<style scoped lang="scss">
.ml-name-selection{
  width: 100%;
}

</style>