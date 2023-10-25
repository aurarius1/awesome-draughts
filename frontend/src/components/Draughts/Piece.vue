<script lang="ts">
import {PropType, StyleValue} from "vue";
import {Position} from "@/vite-env";
import {useColorStore} from "@/store";

export default defineComponent({
  name: "Piece",
  setup(){
    const colorStore = useColorStore();
    const toast = useToast();
    return {colorStore, toast};
  },
  emits: {
    getMoves(){

    },
    pieceSelected(payload: number){
      return payload
    }
  },
  props: {
    pieceId: {
      type: Number,
      default: -1
    },
    piecePosition: {
      type: Object as PropType<Position|undefined>,
      default: undefined
    },
    color: {
      type: String,
      default: ""
    },
    activePlayer: {
      type: String,
      default: ""
    }
  },
  data(){
    return {
      selected: false,
      hover: false,
    }
  },
  computed: {
    computedStyle(): StyleValue{

      let shadow = undefined
      if(this.hover || this.selected)
      {
        let cssColor = this.color === "black" ? "rgba(255, 255, 255, 75%)" : "rgba(0, 0, 0, 75%)"
        shadow = `inset 0 0 10px ${cssColor}`
      }
      return {
        backgroundColor: this.color,
        boxShadow: shadow
      }
    },
    clicked() {
      return this.selected ? "selected" : ""
    }
  },
  methods:
  {
    selectPiece()
    {
      if(this.activePlayer === this.color)
      {
        this.selected = true
        this.$emitter.emit('piece-selected', this.pieceId);
      }
      else {
        this.toast.warning(this.$t("toasts.warning.not_your_turn"))
      }


    }
  },
  created()
  {
    this.$emitter.on('piece-selected', (piece) => {
      if(piece !== this.pieceId)
      {
        this.selected = false;
      }
    })
  }
})
</script>

<template>

  <div
      class="ml-piece"
      :class="clicked"
      :style="computedStyle"

      @mouseover="hover = true"
      @mouseleave="hover = false"

      @click="selectPiece()"
  >
  </div>

</template>

<style scoped lang="scss">
.ml-piece{
  width: 75%;
  height: 75%;
  border-radius: 40px;
}

</style>