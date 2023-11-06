<script lang="ts">
import {PropType, StyleValue} from "vue";
import {useColorStore} from "@/store";
import {Position} from "@draughts/Game.ts";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

export default defineComponent({
  name: "GamePiece",
  components: {FontAwesomeIcon},
  setup(){
    const colorStore = useColorStore();
    const toast = useToast();
    return {getColorStore: colorStore, toast};
  },
  emits: {
    pieceSelected(payload: number){
      return payload
    },
    invalidSelect(){
      return true;
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
    isKing: {
      type: Boolean,
      default: false
    },
    activePlayer: {
      type: String,
      default: ""
    },
    selectedPiece: {
      type: Number,
      default: -1
    }
  },
  data(){
    return {
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
    kingColor(): StyleValue{
      return {
        color: this.getColor()
      }
    },
    clicked() {
      return this.selected ? "selected" : ""
    },
    selected()
    {
      return this.selectedPiece === this.pieceId
    }
  },
  methods:
  {
    selectPiece()
    {
      if(this.activePlayer === this.color)
      {
        this.$emitter.emit('piece-selected', this.pieceId);
      }
      else {
        this.$emit("invalidSelect")
      }
    },
    getColor(type: string = "base")
    {
      return this.getColorStore.currentColor[type]
    }

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
    <div
        v-if="isKing"
        class="king"
        :style="kingColor"
    >
      <font-awesome-icon
        class="icon"
        :icon="['fas', 'fa-crown']"
        size="3x"
      />
    </div>
  </div>

</template>

<style scoped lang="scss">
.ml-piece{
  width: 75%;
  height: 75%;
  border-radius: 100%;
  .king {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

  }
}


</style>