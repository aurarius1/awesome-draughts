<script lang="ts">
import {defineComponent} from "vue";
import VSwatches from 'vuetify-swatches';
import colors from 'vuetify/lib/util/colors'
import {useColorStore} from "@/main.ts";

export default defineComponent({
  name: "Settings",
  setup()
  {
    const colorStore = useColorStore();
    return {colorStore}
  },
  components: {
    VSwatches
  },
  watch: {
    selected(newVal)
    {
      console.log()
      let keys = Object.keys(colors)
      for(let i = 0; i < keys.length; i++)
      {
        if(colors[keys[i]].base === newVal)
        {
          this.colorStore.changeColor(colors[keys[i]])
          break;
        }
      }
    }
  },
  data(){
    return{
      selected: this.colorStore.color.base,
      palette: [[
        colors.red.base,
        colors.pink.base,
        colors.purple.base,
        colors.deepPurple.base,
        colors.indigo.base,
        colors.blue.base,
        colors.lightBlue.base,
        colors.cyan.base,
        colors.teal.base,
        colors.green.base,
        colors.lightGreen.base,
        colors.lime.base,
        colors.yellow.base,
        colors.amber.base,
        colors.orange.base,
        colors.deepOrange.base,
      ]]
    }
  },
  beforeMount()
  {
    console.log(this.selected);
  }
})
</script>

<template>
  <v-container>
    <v-row
      justify="center"
    >
      <v-col
        cols="4"
      >
        <v-card>
          <v-card-title>
            {{ $t('select_color')}}
          </v-card-title>
          <v-card-text>
            <v-swatches
              v-model="selected"
              :swatches="palette"
              icon="fas fa-check-square"

            />
          </v-card-text>
          <v-card-actions>

          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss">
@import 'vuetify-swatches/dist/style.css';
</style>