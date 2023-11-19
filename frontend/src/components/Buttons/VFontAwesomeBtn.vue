<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Anchor} from "@/vite-env"

export type FaSizes = '2xs' | 'xs' | 'sm' | 'lg' | 'xl' | '2xl' | '1x' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x'
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
    iconSize: {
      type: String as PropType<FaSizes>,
      validator (value: FaSizes)
      {
        return ['lg', 'xs', 'sm', '1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x'].includes(value)
      },
      default: undefined
    },
    btnSize: {
      type: String,
      validator(value: string)
      {
        return ['x-small', 'small', 'default', 'large', 'x-large'].includes(value)
      },
      default: 'default'
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
    },
    tooltipText: {
      type: String,
      default: ""
    },
    tooltipLocation: {
      type: String as PropType<Anchor>,
      default: "right",
      validator(value: string) {
        return ["bottom", "top", "left", "right"].includes(value)
      }
    },
    btnRounded: {
      type: String,
      default: "0"
    }
  }
})
</script>

<template>
    <v-btn
        :disabled="disabled"
        :color="btnColor"
        :variant="btnVariant"
        :size="btnSize"
        :rounded="btnRounded"
    >
      <v-tooltip
          v-if="tooltipText !== ''"
          :text="tooltipText"
          activator="parent"
          :location="tooltipLocation"
      />
      <font-awesome-icon
          v-if="icon.length !== 0"
          :icon="icon"
          :size="iconSize"
          :class="text.length !== 0 ? iconTextSpacing : ''"
          :color="iconColor"
      />
      <p v-if="text.length !== 0"> {{ text }}</p>
    </v-btn>
</template>

<style scoped lang="scss">

</style>