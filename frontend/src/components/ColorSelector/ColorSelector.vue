<script lang="ts">
import ColorSwatch from "@/components/ColorSelector/ColorSwatch.vue";

export default defineComponent({
  name: "ColorSelector",
  components: {ColorSwatch},
  emits: {
    colorSelected(payload: string)
    {
      return payload
    }
  },
  props: {
    colors: {
      type: Array,
      default: [[]]
    },
    selectedColor: {
      type: String,
      default: "#ffffff"
    }
  },
  watch:{
    selectedColor(newVal, oldVal){
      this.selected = this.selectedColor
    }
  },
  data(){
    return {
      selected: this.selectedColor,
      selectorVisible: false
    }
  },
  methods: {
    selectNewColor(color: string)
    {
      //this.selected = color
      this.$emit("colorSelected", color);
    }
  }

})
</script>

<template>
  <v-menu
      v-model="selectorVisible"
      position="end"
  >
    <template v-slot:activator="{ props }">
      <color-swatch
        v-bind="props"
        :color="selected"
      />
    </template>
    <v-card>
      <v-container>
        <v-row
          v-for="group in colors"
          :dense="true"
        >
          <v-col
            v-for="color in group"
          >
            <color-swatch
              :color="color"
              @color-selected="selectNewColor"
              :selected="selected===color"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card>

  </v-menu>
</template>

<style scoped lang="scss">
.v-card-text{
  display: flex;
  justify-content: center;
}
</style>