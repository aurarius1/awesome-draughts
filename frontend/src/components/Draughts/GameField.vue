<script lang="ts">
import GameSquare from "@/components/Draughts/GameSquare.vue";
import GamePiece  from "@/components/Draughts/GamePiece.vue";

import Game, {positionEqual, Position, PlayerNames} from "@/draughts";
import {PropType, StyleValue} from "vue";
import {useGameStore} from "@/store";
import {LeaveTypes} from "@/globals.ts"

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
    undoServed(payload: string){
      return payload === "white" || payload === "black"
    },
    redoServed(payload: string)  {
      return payload === "white" || payload === "black"
    },
    gameOver(payload: string)
    {
      return payload === "white" || payload === "black"
    },
    playerNames(payload: PlayerNames)
    {
      return payload.white !== "" && payload.black !== ""
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
      this.$emit('playerNames', this.gameState.playerNames)
    })

  },
  watch: {
    leave(newVal)
    {
      const gameStore = useGameStore();
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
      this.$router.push('/')
    },
    undoRequest(newVal)
    {
      if(!newVal){
        return
      }

      this.toast.info(this.$t('toasts.info.undo_successful'));
      if(this.gameState.undoMove())
      {
        this.$emit('undoPossible', false)
      }
      this.$emit('redoPossible', true)
      this.$emit("undoServed", this.gameState.activePlayer)

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

      this.$emit("redoServed", this.gameState.activePlayer)
    }
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
    const gameStore = useGameStore()
    gameStore.startNewGame(this.fieldDimensions)
    this.$emit('undoPossible', this.gameState.undoPossible())
    this.$emit('redoPossible', this.gameState.redoPossible())
    this.$emit('playerSwitched', this.gameState.activePlayer)
    this.$emit('playerNames', this.gameState.playerNames)
  },
  computed: {
    computedStyle(): StyleValue{
      return {
        height: `${this.height}px`,
        width: `${this.width}px`,
        aspectRatio: '1/1',
        boxSizing: 'border-box',
        borderRadius: "4px",
        boxShadow: '0px 0px 32px 2px rgba(54,54,54,1)'
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
        this.$emit('playerNames', this.gameState.playerNames)
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
    :height="cardHeight"
    max-width="1030px"
    elevation="6"
    :color="getColor('lighten3')"
  >

    <v-container
        :style="computedStyle"
        class="ms-4 me-4 mt-4 mb-2 "
    >
      <v-row
          :style="`height: ${Math.floor(height/10)}px`"
          no-gutters
          v-for="row in gameField"
      >
        <v-col
            v-for="col in row"
        >
          <game-square
              :width="`${Math.floor(width/10)}px`"
              :height="`${Math.floor(height/10)}px`"
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
}
.v-col{
  flex-grow: unset;
}

.ml-game-card{
  overflow-x: scroll;
  overflow-y: scroll;
}


</style>

