<script lang="ts">
import {defineComponent, PropType, StyleValue} from 'vue'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {FaSizes} from "./VFontAwesomeBtn.vue";

export default defineComponent({
  name: "FontAwesomeBtn",
  components: {FontAwesomeIcon},
  setup()
  {
    const colorStore = useColorStore();
    return {getColorStore: colorStore}
  },
  props: {
    icon: {
      type: Array,
      default: [],
    },
    color: {
      type: String,
      default: "base"
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  data(){
    return {
      btnHovered: false,
    }
  },
  computed: {
    btnHoveredStyle(): StyleValue{
      if(!this.btnHovered && !this.active)
        return {};

      return {
        cursor: "pointer",
        color: this.getColor(this.color),
      }
    }
  },
  methods: {
    getColor(color: string = "base")
    {
      return this.getColorStore.currentColor[color]
    }
  }
})
</script>

<template>
<font-awesome-icon
    @mouseover="btnHovered=true"
    @mouseleave="btnHovered=false"
    :icon="icon"
    :style="btnHoveredStyle"
/>
</template>

<style scoped lang="scss">

</style>