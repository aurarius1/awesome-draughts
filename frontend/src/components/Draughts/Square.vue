<script lang="ts">
import {defineComponent} from 'vue'
import colors from 'vuetify/lib/util/colors'
export default defineComponent({
  name: "Square",
  setup()
  {
    const colorStore = useColorStore();
    return {colorStore};
  },
  props: {
    color: {
      type: String,
      default: "",
    },
    width: {
      type: String,
      default: "auto",
    },
    height: {
      type: String,
      default: "auto"
    },
    pieceIdxX: {
      type: Number,
      default: -1,
    },
    pieceIdxY: {
      type: Number,
      default: -1
    }
  },
  computed: {
    computedStyle() {
      console.log(this.width);
      return {
        height: this.height,
        width: this.width,
        backgroundColor: this.getTileColor(),
        aspectRatio: '1/1'
      }
    }
  },
  methods: {
    getTileColor()
    {
      if(this.pieceIdxX % 2 === 0)
      {
        if(this.pieceIdxY % 2 !== 0)
        {
          return this.colorStore.currentColor.darken2
        }
        else
        {
          return colors.grey.lighten2
        }
      }
      else {
        if(this.pieceIdxY % 2 === 0)
        {
          return this.colorStore.currentColor.darken2
        }
        else
        {
          return colors.grey.lighten2
        }
      }
    }
  }
})
</script>

<template>
<div
  class="ml-square"
  :class="`x-${pieceIdxX} y-${pieceIdxY}`"
  :style="computedStyle"
>

</div>
</template>

<style scoped lang="scss">
.ml-square{
  position: relative;
  box-sizing: border-box;
  pointer-events: none;
}
</style>