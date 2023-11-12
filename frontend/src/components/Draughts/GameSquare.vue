<script lang="ts">
import {defineComponent} from 'vue'
import colors from 'vuetify/lib/util/colors'
import GamePiece from "@/components/Draughts/GamePiece.vue";
import {isPlayableField, positionEqual} from "@/draughts";
import {Position} from "@draughts/Game.ts";
import {useGameStore} from "@/store";

export default defineComponent({
  name: "GameSquare",
  components: {GamePiece},
  setup()
  {
    const colorStore = useColorStore();
    const toast = useToast();
    return {getColorStore: colorStore, toast};
  },
  emits: {
    moveSelectedTo(gameSquarePos: Position, isHighlighted: boolean){
        return true;
    }
  },
  created()
  {
    /*
      TODO TEST IF NEEDED
    this.$emitter.on('highlight-field', (fields: Array<Position>) => {
      this._highlight = false;
      let searchResult = fields.find((field) => {
        return field.x === this.position?.x && field.y === this.position?.y
      })
      if(searchResult){
          this._highlight = true;
      }
    })*/
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
    position: {
      type: Object as PropType<Position>,
      default: {x: -1, y: -1}
    }
  },
  data()
  {
    return {
      _highlight: false,
      pieceSelected: false,
    }
  },
  computed: {
    computedStyle() {
      return {
        height: this.height,
        width: this.width,
        backgroundColor: this.getTileColor(),
        aspectRatio: '1/1'
      }
    },
    highlight() {
      const gameStore = useGameStore();
      return gameStore._currentApiGame?._validMoves.find((field) => {
        return field.x === this.position?.x && field.y === this.position?.y
      })
    }
  },
  methods: {
    getTileColor()
    {
      if(isPlayableField(this.position?.x, this.position?.y))
      {
        return this.getColorStore.currentColor.darken2;
      }
      return colors.grey.lighten2
    },
    moveToMe()
    {
      this.$emit('moveSelectedTo', this.position, this.highlight)

    }
  },
  beforeMount()
  {

  }
})
</script>

<template>
  <div
    class="ml-square"
    :class="`x-${position?.x} y-${position?.y}`"
    :style="computedStyle"
    @click="moveToMe()"
  >
    <div v-if="highlight" class="highlighted">

    </div>
      <slot
          name="piece"
      ></slot>
  </div>
</template>

<style scoped lang="scss">
.ml-square{
  position: relative;
  box-sizing: border-box;

  display: flex;
  justify-content: center;
  align-items: center;


  &:hover{
    .highlighted{
      border-radius: unset ;
      width: 100%;
      height: 100%;
    }
  }
  .highlighted{
    background-color: rgba(0, 0, 0, 50%) !important;
    border-radius: 200px;
    width: 50%;
    height: 50%;
  }

}

</style>
