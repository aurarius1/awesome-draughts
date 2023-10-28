<script lang="ts">
import GameSquare from "@/components/Draughts/GameSquare.vue";
import GamePiece  from "@/components/Draughts/GamePiece.vue";

import Game, {positionEqual} from "@/draughts";
import {StyleValue} from "vue";
import {useGameStore} from "@/store";



export default defineComponent({
  name: "GameField",
  components: {GamePiece, GameSquare},
  setup()
  {
    const colorStore = useColorStore()
    const toast = useToast()

    return {colorStore, toast}
  },
  emits: {
    playerSwitched(payload: string)
    {
      return payload === "white" || payload === "black";
    }
  },
  created(){
    this.$emitter.on('piece-selected', (piece: number) => {
      this.currentlySelectedPiece = piece
      this.$emitter.emit("highlight-field", this.gameState.getFieldsToHighlight(piece));
    })

  },
  watch: {
    leave(newVal)
    {
      const gameStore = useGameStore();
      switch(newVal)
      {
        case 1:
          gameStore.endAndSave(false)
          break
        case 2:
          gameStore.endAndSave(true)
          break
        case 3:
          gameStore.clear()
          break
        default:
          return
      }
      this.$router.push('/')
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
      type: Number,
      default: -1,
    }
  },
  data()
  {
    return {
      _gameState: undefined as undefined|Game,
      currentlySelectedPiece: -1,
    }
  },
  beforeMount()
  {
    const gameStore = useGameStore()
    gameStore.startNewGame(this.fieldDimensions)
    this.$emit('playerSwitched', this.gameState.activePlayer)

  },
  computed: {
    computedStyle(): StyleValue{
      return {
        height: `${this.height}px`,
        width: `${this.width}px`,
        aspectRatio: '1/1',
        boxSizing: 'border-box',
        marginTop: "24px"
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
        this.toast.warning(this.$t('toasts.warning.invalid_move'))
        return
      }
      this.$emitter.emit('highlight-field', [])
      this.gameState.movePiece(this.currentlySelectedPiece, targetPosition)
      this.currentlySelectedPiece = -1

      let winner = this.gameState?.isGameOver()
      if(winner === this.gameState?.activePlayer)
      {
        this.toast.success(this.$t(`player.wins.${winner}`))
        this.$router.push("/")
        return;
      }

      this.gameState.switchActivePlayer();
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
                  @invalid-select="invalidSelect()"
                />
              </template>
            </game-square>
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

