<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {PlayerNames} from "@/draughts";
import SelectionRow from "@/components/NameSelection/SelectionRow.vue";

export default defineComponent({
  name: "NameSelection",
  components: {SelectionRow},
  emits: {
    leaveGameSettings(){}
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
  />
  <selection-row
    player="black"
    :name="this.defaultNames.black"
    class="ml-name-selection"
  />
  <v-btn
      @click="$emit('leaveGameSettings')"
      :color="getColorStore().currentColor.accent1"
      class="ml-leave-game-settings"
  >
    {{ $t("exit_game_settings") }}
  </v-btn>
</template>

<style scoped lang="scss">
.ml-name-selection{
  width: 100%;
}
.ml-leave-game-settings
{
  margin-top: 12px;
}
</style>