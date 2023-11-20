<script lang="ts">
import GameSquare from "@/components/Draughts/GameSquare.vue";
import GamePiece  from "@/components/Draughts/GamePiece.vue";

import {
  positionEqual,
  Position,
  PieceColor
} from "@/draughts";
import {PropType, StyleValue} from "vue";
import {useGameStore} from "@/store";
import {LeaveTypes} from "@/globals.ts"

export default defineComponent({
  name: "GameField",
  components: {GamePiece, GameSquare},
  setup()
  {
    const colorStore = useColorStore()
    const gameStore = useGameStore()
    const toast = useToast()

    return {getColorStore: colorStore, toast, gameStore}
  },
  emits: {
    dimensions(dimensionsInPx: number, borderThickness: number)
    {
      return dimensionsInPx > 0 && borderThickness > 0;
    }
  },
  created(){
    this.$emit('dimensions', this.dimensionsInPx, this.borderThickness)
  },
  props: {
    cardDimensions: {
      type: Number,
      required: true,
      validator (value: number){
        return value > 0 && value <= 100
      }
    },
    fieldDimensions: {
      type: Number,
      default: 10
    },
    leave: {
      type: Number as PropType<LeaveTypes>,
      default: LeaveTypes.noLeave,
    },
    undoRequest: {
      type: Boolean,
      default: false
    },
    redoRequest: {
      type: Boolean,
      default: false
    },
  },
  beforeMount()
  {
    const gameStore = useGameStore();
    if(gameStore._currentApiGame === undefined && gameStore._currentGameId !== "")
    {
      gameStore.startWebSocket("");
    }
    window.onbeforeunload = function(){
      return "";
    }
  },
  computed: {
    dimensionsInPx(){
      let dim= 0;
      let scale = this.cardDimensions/100;

      if(document.documentElement.clientHeight <= document.documentElement.clientWidth)
      {
        dim = Math.floor(document.documentElement.clientHeight*scale)
      }
      else
      {
        dim = Math.floor(document.documentElement.clientWidth*scale*(2/3))
      }
      dim = dim - dim%this.fieldDimensions
      return dim
    },
    gameFieldStyle(): StyleValue{
      return {
        height: `${this.dimensionsInPx}px`,
        width: `${this.dimensionsInPx}px`,
        aspectRatio: '1/1',
        boxSizing: 'border-box',
        borderRadius: "4px",
        boxShadow: '0px 0px 32px 2px rgba(54,54,54,1)'
      }
    },
    cardStyle(): StyleValue{
      return {
        height: `${this.dimensionsInPx+this.borderThickness}px`,
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        verticalAlign: 'center',
        aspectRatio: '1/1',
      }
    },
    borderThickness() {
      return Math.floor(this.dimensionsInPx / (this.fieldDimensions*10))*2;
    },
    gameFieldRowStyle(): StyleValue{
      return {
        height: `${this.dimensionsInPx/10}px`
      }
    },
    squareStyle(): StyleValue{
      return {
        height: `${this.dimensionsInPx/10}px`,
        width: `${this.dimensionsInPx/10}px`
      }
    },
    gameField(){
      const gameStore = useGameStore();
      return gameStore.currentGame?._field
    },
    currentlySelectedPiece()
    {
      const gameStore = useGameStore()
      return gameStore.currentGame?._selectedPiece ?? -1
    }
  },
  methods: {
    movePiece(targetPosition: Position)
    {

      let selectedPiecePosition = this.gameStore.currentGame?.getPositionOfPiece(this.currentlySelectedPiece)
      if(selectedPiecePosition === undefined || positionEqual(selectedPiecePosition, targetPosition))
      {
        return
      }
      this.gameStore.move(this.currentlySelectedPiece, targetPosition)
    },
    invalidSelect()
    {
      if(this.currentlySelectedPiece !== -1)
      {
        // no need to emit warning, different warning is already displayed
        return;
      }
    },
    getColor(color: string = "base"){
      return this.getColorStore.currentColor[color]
    },
    getActivePlayer() {
      return this.gameStore.currentGame?._currentPlayer;
    },
    isPieceKing(pieceColor: PieceColor, pieceId: number){
      let apiGame  = this.gameStore.currentGame ?? undefined;
      if(apiGame === undefined)
        return false;
      return apiGame._pieces[pieceColor][pieceId].isKing;
    }
  }
})
</script>

<template>
  <v-card
    class=" ml-game-card"
    elevation="6"
    :color="getColor('lighten3')"
    :style="cardStyle"
  >
    <v-container
        :style="gameFieldStyle"
    >
      <v-row
          :style="gameFieldRowStyle"
          no-gutters
          v-for="row in gameField"
      >
        <v-col
            v-for="col in row"
        >
          <game-square
              :style="squareStyle"
              :position="col.position"
              @move-selected-to="movePiece"
          >
            <template v-slot:piece>
              <game-piece
                v-if="col.containsPiece"
                :color="col.pieceColor"
                :piece-id="col.pieceId"
                :piece-position="col.position"
                :active-player="getActivePlayer()"
                :is-king="isPieceKing(col.pieceColor, col.pieceId)"
                :selected-piece="currentlySelectedPiece"
              />
            </template>
          </game-square>
        </v-col>
      </v-row>

    </v-container>

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
  max-width: 100% !important;
}
.v-col{
  flex-grow: unset;
}

.ml-game-card{
  overflow-x: scroll;
  overflow-y: scroll;
}


</style>

