<script lang="ts">
import {defineComponent, StyleValue} from 'vue'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

export default defineComponent({
  name: "FontAwesomeBtn",
  components: {FontAwesomeIcon},
  setup()
  {
    const colorStore = useColorStore();
    return {colorStore}
  },
  props: {
    icon: {
      type: Array,
      default: [],
    },
    color: {
      type: String,
      default: "base"
    }
  },
  data(){
    return {
      btnHovered: false,
    }
  },
  computed: {
    btnHoveredStyle(): StyleValue{
      if(!this.btnHovered)
        return;


      return {
        cursor: "pointer",
        color: this.getColor(this.color),
      }
    }
  },
  methods: {
    getColor(color: string = "base")
    {
      return this.colorStore.currentColor[color]
    }
  }
})
</script>

<template>
<font-awesome-icon
    @mouseover="btnHovered=true"
    @mouseleave="btnHovered=false"
    :icon="this.icon"
    :style="btnHoveredStyle"
/>
</template>

<style scoped lang="scss">

</style>