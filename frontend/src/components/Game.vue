<script lang="ts">
import GameField from "@/components/Draughts/GameField.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {StyleValue} from "vue";
import {LeaveTypes} from '@/globals.ts'
import FontAwesomeBtn from "@/components/Buttons/FontAwesomeBtn.vue";
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";
import Settings from "@/components/Settings.vue";
import {PlayerNames} from "@/draughts";
import NameSelection from "@/components/GameSettings/NameSelection.vue";
import Moves from "@/components/Draughts/Moves.vue";
import LocalGameSettings from "@/components/GameSettings/LocalGameSettings.vue";
import EndGameDialog from "@/components/Dialog/EndGameDialog.vue";
import SaveGameDialog from "@/components/Dialog/SaveGameDialog.vue";
import GameInfo from "@/components/GameInfo.vue";
import {useGameStore} from "@/store";

export default defineComponent({
  name: "Game.vue",
  components: {GameInfo, SaveGameDialog, EndGameDialog, LocalGameSettings, Moves, NameSelection, Settings, VFontAwesomeBtn, FontAwesomeBtn, FontAwesomeIcon, GameField},
  setup()
  {
    const colorStore = useColorStore();
    const toast = useToast();
    return {getColorStore: colorStore, toast}
  },
  created(){

    this.$emitter.on("draw", () => {
      this.endGameDialogVisible=true
      this.endGameDialogText = "draw"
      this.endGameDialogTextLocalization = true
    })
  },
  data() {
    return{
      playerWantsToLeave: false,
      exitType: LeaveTypes.noLeave,
      undoRequest: false,
      redoRequest: false,
      undoPossible: false,
      redoPossible: false,
      settingsVisible: false,
      gameSettingsVisible: false,
      endGameDialogVisible: false,
      endGameDialogText: "",
      dimensions: 0,
      borderThickness: 0,
      endGameDialogTextLocalization: false,
    }
  },
  methods: {
    leaveAndSaveRemote() {
      this.exitType = LeaveTypes.saveRemote
    },
    leaveAndSaveLocal(){
      this.exitType = LeaveTypes.saveLocal
    },
    leaveGame(){
      this.exitType = LeaveTypes.exit
    },
    getColor(color: string = 'lighten1'){
        return this.getColorStore.currentColor[color]
    },
    undoServed() {
      this.undoRequest = false
    },
    redoServed() {
      this.redoRequest = false
    },
    getPlayerName: function (player: string = "") {
      const gameStore = useGameStore();
      if (player === "") {
        player = this.currentPlayer
      }
      return gameStore.currentGame.getPlayerName(player);
    },
    gameOver(winner: string) {
      this.endGameDialogText = this.$t(`player.wins`, {name: this.getPlayerName(winner)})
      this.endGameDialogVisible=true;
    },
    setDimensions(dimensions: number, borderThickness: number)
    {
      this.dimensions = dimensions
      this.borderThickness = borderThickness
    }
  },
  computed:
  {
    infoCardContainerStyle(): StyleValue{
      return {
        height: `${this.dimensions+this.borderThickness}px`,
        minWidth: "300px",
        aspectRatio: '1/2',
        backgroundColor: this.getColor('lighten3'),
        borderRadius: "4px"
      }
    },
    currentPlayer() {
      const gameStore = useGameStore();
      return gameStore.currentGame.activePlayer
    }


  }
})
</script>

<template>
  <save-game-dialog
    :visible="playerWantsToLeave"
    @close-me="playerWantsToLeave=false"
    @exit="leaveGame()"
    @save-local="leaveAndSaveLocal()"
    @save-remote="leaveAndSaveRemote()"
  />
  <end-game-dialog
    :visible="endGameDialogVisible"
    :text="endGameDialogText"
    :localize-text="endGameDialogTextLocalization"
  />

  <div
    class="ml-game-container"
  >
    <game-field
      :leave="exitType"
      :card-dimensions="80"
      @undo-served="undoServed"
      @redo-served="redoServed"
      @undo-possible="(possible: boolean) => {undoPossible=possible}"
      @redo-possible="(possible: boolean) => {redoPossible=possible}"
      @game-over="gameOver"
      :undo-request="undoRequest"
      :redo-request="redoRequest"
      @dimensions="setDimensions"
    />
    <div
      class="ml-game-info-card-container ml-12"
      :style="infoCardContainerStyle"
    >
      <game-info
        @leave-request="playerWantsToLeave=true"
        @undo-request="undoRequest=true"
        @redo-request="redoRequest=true"
        :undo-possible="undoRequest || !undoPossible"
        :redo-possible="redoRequest || !redoPossible"
        :dimensions-in-px="dimensions"
        :border-thickness="borderThickness"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">


.ml-game-container{
  display: flex;
  height: calc(100vh - 56px);
  align-items: center;
  align-content: center;
  vertical-align: center;
  justify-content: center;
  overflow-y: hidden;

  .ml-game-info-card-container{
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
    vertical-align: center;

  }

}


.ml-save-dialog{
  .ml-save-dialog-text{
    text-align: justify;
    text-justify: inter-word;
  }
  .ml-save-dialog-actions{
    display: flex;
    justify-content: space-evenly;
  }
}




</style>
