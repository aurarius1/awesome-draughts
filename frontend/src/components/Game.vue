<script lang="ts">
import GameField from "@/components/Draughts/GameField.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {StyleValue} from "vue";
import {LeaveTypes} from '@/globals.ts'
import FontAwesomeBtn from "@/components/Buttons/FontAwesomeBtn.vue";
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";
import Settings from "@/components/Settings.vue";
import Moves from "@/components/Draughts/Moves.vue";
import LocalGameSettings from "@/components/GameSettings/GameSettings.vue";
import EndGameDialog from "@/components/Dialog/EndGameDialog.vue";
import SaveGameDialog from "@/components/Dialog/SaveGameDialog.vue";
import GameInfo from "@/components/GameInfo.vue";
import {useGameStore} from "@/store";
import WaitingForResponseDialog from "@/components/Dialog/WaitingForResponseDialog.vue";

export default defineComponent({
  name: "Game.vue",
  components: {WaitingForResponseDialog, GameInfo, SaveGameDialog, EndGameDialog, LocalGameSettings, Moves, Settings, VFontAwesomeBtn, FontAwesomeBtn, FontAwesomeIcon, GameField},
  setup()
  {
    const colorStore = useColorStore();
    const toast = useToast();
    const gameStore = useGameStore();
    return {getColorStore: colorStore, toast, gameStore}
  },
  created(){

    this.$emitter.on("draw", () => {
      this.endGameDialogVisible=true
      this.endGameDialogText = "draw"
      this.endGameDialogTextLocalization = true
    })
    this.$emitter.on("opponentExited", () => {
      this.playerWantsToLeave = true;
    });


  },
  data() {
    return{
      playerWantsToLeave: false,
      exitType: LeaveTypes.noLeave,
      settingsVisible: false,
      gameSettingsVisible: false,
      endGameDialogText: "",
      dimensions: 0,
      borderThickness: 0,
      endGameDialogTextLocalization: false,
    }
  },
  methods: {
    getGameStore()
    {
      return this.gameStore;
    },
    leaveGame(){
      this.exitType = LeaveTypes.exit
    },
    getColor(color: string = 'lighten1'){
        return this.getColorStore.currentColor[color]
    },
    getPlayerName: function (player: string = "") {
      if (player === "") {
        player = this.currentPlayer ?? ""
      }
      return this.getGameStore().currentGame?._playerNames[player];
    },
    gameOver(winner: string) {
      this.endGameDialogText = this.$t(`player.wins`, {name: this.getPlayerName(winner)})
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
      return this.getGameStore()._currentApiGame?._currentPlayer
    },
    endGameDialogVisible(){
      return this.getGameStore().currentGame?._gameOver ?? false
    },
    waitingForResponse()
    {
      return this.getGameStore().requestSent
    }
  }
})
</script>

<template>
  <save-game-dialog
    :visible="playerWantsToLeave"
    @close-me="playerWantsToLeave=false"
  />
  <end-game-dialog
    :visible="endGameDialogVisible"
  />

  <waiting-for-response-dialog
      :visible="waitingForResponse"
  />

  <div
    class="ml-game-container"
  >
    <game-field
      :leave="exitType"
      :card-dimensions="80"
      @game-over="gameOver"
      @dimensions="setDimensions"
    />
    <div
      class="ml-game-info-card-container ml-12"
      :style="infoCardContainerStyle"
    >
      <game-info
        @leave-request="playerWantsToLeave=true"
        :dimensions-in-px="dimensions"
        :border-thickness="borderThickness"
        v-if="getGameStore().currentGame !== undefined"
      />
      <v-progress-circular
        :indeterminate="true"
        width="8"
        size="100"
        v-else
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
