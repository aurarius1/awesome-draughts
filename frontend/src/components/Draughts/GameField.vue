<script lang="ts">
import {defineComponent} from 'vue'
import Square from "@/components/Draughts/Square.vue";

export default defineComponent({
  name: "GameField",
  components: {Square},
  setup()
  {
    const colorStore = useColorStore()
    return {colorStore}
  },
  props: {
    cardHeight: {
      type: String,
      default: "1030px"
    },
    height: {
      type: Number,
      default: 960
    },
    width: {
      type: Number,
      default: 960,
    }
  },

  computed: {
    computedSideLength()
    {
      return Math.floor((document.documentElement.clientWidth/100)*40);
    },

    computedStyle() {
      console.log();
      return {
        height: `${this.height}px`,
        width: `${this.width}px`,
        aspectRatio: '1/1',
        boxSizing: 'border-box',
        marginTop: "24px"
      }
    }
  }
})
</script>

<template>
  <v-card
    class="mt-16 mb-16 ml-game-card"
    :height="cardHeight"
    max-width="1030px"
    elevation="6"
  >
    <v-card-text>
      <v-container
          :style="computedStyle"
      >
        <v-row
            :style="`height: ${Math.floor(this.height/10)}px`"
            no-gutters
            v-for="j in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"
        >
          <v-col
              v-for="i in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"
          >
            <square
                :width="`${Math.floor(this.width/10)}px`"
                :height="`${Math.floor(this.height/10)}px`"
                :piece-idx-x="j"
                :piece-idx-y="i"
            />
          </v-col>
        </v-row>

      </v-container>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">

.v-container{
  padding: unset;
  overflow-y: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: pointer;
  line-height: 0;
}
.v-col{
  flex-grow: unset;
}

.ml-game-card{
  overflow-x: scroll;
  overflow-y: scroll;
}
</style>

