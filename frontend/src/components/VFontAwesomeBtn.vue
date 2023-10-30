<script lang="ts">
import {defineComponent, PropType} from 'vue'

type FaSizes = '2xs' | 'xs' | 'sm' | 'lg' | 'xl' | '2xl' | '1x' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x'
type VBtnVariant = 'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain'

export default defineComponent({
  name: "VFontAwesomeBtn",
  props: {
    icon: {
      type: Array,
      default: []
    },
    text: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String as PropType<FaSizes>,
      validator (value: FaSizes){
        return ['lg', 'xs', 'sm', '1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x'].includes(value)
      },
      default: 'sm'
    },
    btnColor: {
      type: String,
      default: ''
    },
    iconColor: {
      type: String,
      default: ""
    },
    btnVariant: {
      type: String as PropType<VBtnVariant>,
      default: 'text',
      validator(value: string){
        return ['text', 'flat', 'elevated', 'tonal', 'outlined', 'plain'].includes(value)
      }
    },
    iconTextSpacing: {
      type: String,
      default: "me-4",
      validator(value: string){
        return value.startsWith("me-")
      }
    }
  }
})
</script>

<template>
  <v-btn
    :disabled="disabled"
    :color="btnColor"
    :variant="btnVariant"
  >
    <font-awesome-icon
        v-if="icon.length !== 0"
        :icon="icon"
        :size="size"
        :class="iconTextSpacing"
        :color="iconColor"
    />
    {{ text }}
  </v-btn>

</template>

<style scoped lang="scss">

</style>