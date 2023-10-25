<script lang="ts">
import {defineComponent} from 'vue'
import colors from 'vuetify/lib/util/colors'
import Piece from "@/components/Draughts/Piece.vue";
import {isPlayableField} from "@draughts";
import {Position} from "@/vite-env";

export default defineComponent({
  name: "Square",
  components: {Piece},
  setup()
  {
    const colorStore = useColorStore();
    const toast = useToast();
    return {colorStore, toast};
  },
  emits: {
    moveSelectedTo(payload: Position){
      return payload
    }
  },
  created()
  {
    this.$emitter.on('highlight-field', (fields: Array<Position>) => {
      this.highlight = false;
      let searchResult = fields.find((field) => {
        return field.x === this.position?.x && field.y === this.position?.y
      })
      if(searchResult){
          this.highlight = true;
      }
    })

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
    },
    selectedPiece: {
      type: Object as PropType<Position>,
      default: undefined
    }
  },
  watch:
  {
    selectedPiece(newVal)
    {
      if(newVal === undefined)
      {
        this.highlight = false
      }
    }
  },
  data()
  {
    return {
      highlight: false,
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
  },
  methods: {
    getTileColor()
    {
      if(isPlayableField(this.position?.x, this.position?.y))
      {
        return this.colorStore.currentColor.darken2;
      }
      return colors.grey.lighten2
    },
    moveToMe()
    {

      if(this.selectedPiece === this.position || this.selectedPiece === undefined)
      {
        return;
      }
      if(!this.highlight)
      {
        this.toast.warning(this.$t('toasts.warning.invalid_move'))
        return;
      }

      this.$emit('moveSelectedTo', this.position)

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
