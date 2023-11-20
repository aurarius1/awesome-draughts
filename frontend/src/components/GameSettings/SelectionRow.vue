<script lang="ts">
import {defineComponent, StyleValue} from 'vue'
import NameField from "@/components/TextFields/NameField.vue";

export default defineComponent({
  name: "SelectionRow",
  components: {NameField},
  emits: {
    playerNameChanged(playerType: string, _: string){
      return playerType === "white" || playerType === "black";
    },
    switchPlayer(){
      return true;
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
    },
    remote: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return{
      hover: false,
    }
  },
  computed: {
    playerStyle(): StyleValue{
      let color = this.getColorStore().currentColor["base"];
      if(this.remote && this.hover)
      {
        color = this.getColorStore().currentColor["lighten2"]
      }

      return {
        color: color,
        fontWeight: 'bold',
        cursor: this.remote ? 'pointer' : "unset",
      }
    },


  },
  methods: {
    getColorStore()
    {
      return this.colorStore;
    },
    switchPlayerType()
    {
      if(this.remote)
      {
        this.$emit('switchPlayer');
      }

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
    @mouseover="hover=true"
    @mouseleave="hover=false"
    @click="switchPlayerType()"
  >
    {{ $t(`player.${player}`) }}
  </p>

  <div
      class="ml-name-selection-field"
  >
    <name-field
        :name="name"
        @updated="(value: string) => $emit('playerNameChanged', player, value)"
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