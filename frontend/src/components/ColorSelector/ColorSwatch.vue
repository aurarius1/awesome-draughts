<script lang="ts">
import {FontAwesomeLayers} from "@fortawesome/vue-fontawesome";

export default defineComponent({
  name: "ColorSwatch",
  components: {FontAwesomeLayers},
  emits: {
    colorSelected(payload: string){
      return payload
    }
  },
  props: {
    height: {
      type: String,
      default: "40px"
    },
    width: {
      type: String,
      default: "40px"
    },
    color: {
      type: String,
      default: "#ffffff"
    },
    borderRadius: {
      type: String,
      default: "4px"
    },
    selected: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    getStyle()
    {
      return {
        height: this.height,
        width: this.width,
        backgroundColor: this.color,
        borderRadius: this.borderRadius
      }
    }
  }
})
</script>

<template>
  <div
    :style="getStyle()"
    class="ml-color-swatch"
    @click="$emit('colorSelected', color)"
  >
    <font-awesome-icon
        v-if="selected"
        :icon="['far', 'check-circle']"
        size="lg"
        style="color: #000000;"

    />
  </div>
</template>

<style scoped lang="scss">
.ml-color-swatch{

  display: flex;
  justify-content: center;
  align-items: center;

  &:hover,
  &:focus {
    opacity: 0.9;
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.75);
    outline: none;
    cursor: pointer;
  }
}
</style>