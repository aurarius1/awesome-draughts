<script lang="ts">
import {defineComponent, StyleValue} from 'vue'
import {PlayerNames} from "@/draughts";

export default defineComponent({
  name: "SelectionRow",
  watch: {
    name(newName){
      this._name = newName
    }
  },
  setup()
  {
    const colorStore = useColorStore();
    return {colorStore}
  },
  props: {
    player: {
      type: String,
      default: "white",
      validator(value){
        return value === "white" || value === "black"
      }
    },
    name: {
      type: String,
      default: "Eve",
    }
  },
  data() {
    return{
      _name: this.name
    }
  },
  computed: {
    playerStyle(): StyleValue{
      return {
        color: this.getColorStore().currentColor["base"],
        fontWeight: 'bold'
      }
    }
  },
  methods: {
    getColorStore()
    {
      return this.colorStore;
    }
  }
})
</script>

<template>
<div
  class="ml-name-selection-row"
>
  <p
    :style="playerStyle"
    class="text-subtitle-1"
  >
    {{ this.$t(`player.${player}`) }}
  </p>

  <div
      class="ml-name-selection-field"
  >
    <v-text-field
        v-model="_name"
        :hide-details="true"
        @update:model-value="this.$emitter.emit('player-name-changed', player, _name)"
    />
  </div>
</div>
</template>

<style scoped lang="scss">
.ml-name-selection-row{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .ml-name-selection-field{
    width: 75%;
  }
}
</style>