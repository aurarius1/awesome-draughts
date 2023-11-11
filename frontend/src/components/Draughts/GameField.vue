<script lang="ts">
import GameSquare from "@/components/Draughts/GameSquare.vue";
import GamePiece  from "@/components/Draughts/GamePiece.vue";

import Game, {positionEqual, Position, PlayerNames} from "@/draughts";
import {PropType, StyleValue} from "vue";
import {useGameStore} from "@/store";
import {LeaveTypes} from "@/globals.ts"
import { socketState, socket } from "@/draughts";
import {useWebSocket} from "@vueuse/core";

export default defineComponent({
  name: "GameField",
  components: {GamePiece, GameSquare},
  setup()
  {
    const colorStore = useColorStore()
    const toast = useToast()

    return {getColorStore: colorStore, toast}
  },
  emits: {
    playerSwitched(payload: string)
    {
      return payload === "white" || payload === "black"
    },
    redoPossible(payload: boolean)
    {
      return true
    },
    undoPossible(payload: boolean)
    {
      return true
    },
    undoServed(){
      return true
    },
    redoServed()  {
      return true
    },
    gameOver(payload: string)
    {
      return payload === "white" || payload === "black"
    },
    playerNames(payload: PlayerNames)
    {
      return payload.white !== "" && payload.black !== ""
    },
    dimensions(dimensionsInPx: number, borderThickness: number)
    {
      return dimensionsInPx > 0 && borderThickness > 0;
    }
  },
  created(){
    this.$emitter.on('piece-selected', (piece: number) => {
      if(this.isOnKillStreak)
      {
        return
      }
      this.currentlySelectedPiece = piece
      this.$emitter.emit("highlight-field", this.gameState.getFieldsToHighlight(piece));
    })


    this.$emitter.on('player-name-changed', (player: string, name: string) => {
      this.gameState.updatePlayerName(player, name)
    })

    this.$emitter.on('draw', () => {
      const gameStore = useGameStore()
      gameStore.clear();
    })

    this.$emit('dimensions', this.dimensionsInPx, this.borderThickness)

  },
  watch: {
    leave(newVal)
    {
      this.$router.replace('/').then(() => {
        const gameStore = useGameStore();
        gameStore.closeWS();
        switch(newVal)
        {
          case LeaveTypes.saveLocal:
            gameStore.endAndSave(false)
            break
          case LeaveTypes.saveRemote:
            gameStore.endAndSave(true)
            break
          case LeaveTypes.exit:
            gameStore.clear()
            break
          default:
            return
        }

      })


    },
    undoRequest(newVal)
    {
      if(!newVal){
        return
      }

      if(this.isOnKillStreak)
      {
        this.toast.warning(this.$t('toasts.warning.undo_on_killstreak'))
        this.$emit("undoServed")
        return;
      }

      this.toast.info(this.$t('toasts.info.undo_successful'));
      if(this.gameState.undoMove())
      {
        this.$emit('undoPossible', false)
      }
      this.$emit('redoPossible', true)
      this.$emit("undoServed")

    },
    redoRequest(newVal)
    {
      if(!newVal){
        return
      }
      this.toast.info(this.$t('toasts.info.redo_successful'));
      if(this.gameState.redoMove())
      {
        this.$emit('redoPossible', false)
      }
      this.$emit('undoPossible', true)

      this.$emit("redoServed")
    }
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
  data()
  {
    return {
      _gameState: undefined as undefined|Game,
      currentlySelectedPiece: -1,
      isOnKillStreak: false
    }
  },
  beforeMount()
  {

    this.$emit('undoPossible', this.gameState.undoPossible())
    this.$emit('redoPossible', this.gameState.redoPossible())
    this.$emit('playerSwitched', this.gameState.activePlayer)
    this.$emit('playerNames', this.gameState.playerNames)
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
      console.log(dim)
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
      return this.gameState.field
    },
    gameState(): Game{
      const gameStore = useGameStore()
      if(gameStore.currentGame.fieldDimensions === -1)
      {
        gameStore.startNewGame(this.fieldDimensions)
        this.$emit('dimensions', this.dimensionsInPx)
      }
      return gameStore.currentGame
    }
  },
  methods: {
    movePiece(targetPosition: Position, isHighlighted: Boolean)
    {
      let selectedPiecePosition = this.gameState.getPositionOfPiece(this.currentlySelectedPiece)
      if(selectedPiecePosition === undefined || positionEqual(selectedPiecePosition, targetPosition))
      {
        return
      }

      if(!isHighlighted)
      {
        if(this.isOnKillStreak)
        {
          this.toast.error(this.$t('toasts.error.on_kill_streak'))
        }
        else
        {
          this.toast.warning(this.$t('toasts.warning.invalid_move'))
        }
        return
      }
      this.$emitter.emit('highlight-field', [])
      let killStreakPossible = this.gameState.movePiece(this.currentlySelectedPiece, targetPosition)
      if(killStreakPossible.length !== 0)
      {
        this.$emitter.emit('highlight-field', killStreakPossible)
        this.isOnKillStreak = true
        return;
      }
      else
      {
        this.isOnKillStreak = false
      }



      this.currentlySelectedPiece = -1

      let winner = this.gameState?.isGameOver()

      if(winner === this.gameState?.activePlayer)
      {
        const gameStore = useGameStore()
        gameStore.clear()
        this.$emit('gameOver', winner)
        return;
      }





      this.gameState.switchActivePlayer();
      this.$emit('undoPossible', true)
      this.$emit('redoPossible', false)
      this.$emit('playerSwitched', this.gameState.activePlayer ?? "");
    },
    invalidSelect()
    {
      if(this.currentlySelectedPiece !== -1)
      {
        // no need to emit warning, different warning is already displayed

        return;
      }
      this.toast.warning(this.$t("toasts.warning.not_your_turn"))
    },
    getColor(color: string = "base"){
      return this.getColorStore.currentColor[color]
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
                :color="col.piece?.color"
                :piece-id="col.piece?.id"
                :piece-position="col.piece?.position"
                :active-player="gameState.activePlayer"
                :is-king="col.piece?.isKing"
                :selected-piece="currentlySelectedPiece"
                @invalid-select="invalidSelect()"
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

