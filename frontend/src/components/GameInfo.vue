<script lang="ts">
import {defineComponent, StyleValue} from 'vue'
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";
import Moves from "@/components/Draughts/Moves.vue";
import Settings from "@/components/Settings.vue";
import FontAwesomeBtn from "@/components/Buttons/FontAwesomeBtn.vue";
import GameSettings from "@/components/GameSettings/GameSettings.vue";
import {PermissionRequest} from "@/globals.ts";
import {useGameStore} from "@/store";

export default defineComponent({
  name: "GameInfo",
  components: {GameSettings, FontAwesomeBtn, Settings, Moves, VFontAwesomeBtn},
  emits: {
    leaveRequest(){
      return true
    }
  },
  setup()
  {
    const colorStore = useColorStore();
    const gameStore = useGameStore();
    return {colorStore, gameStore}
  },
  watch: {
    requestToAnswer(newVal){
      if(newVal)
      {
        this.gameSettingsVisible=false
        this.settingsVisible = false
      }
    }
  },
  props: {
    dimensionsInPx: {
      type: Number,
      required: true
    },
    borderThickness: {
      type: Number,
      required: true
    }
  },
  data(){
    return {
      gameSettingsVisible: false,
      settingsVisible: false,
    }
  },
  methods: {
    getColor(color: string = 'lighten1'){
      return this.colorStore.currentColor[color]
    },
    getGameStore()
    {
      return this.gameStore;
    },
  },
  computed: {
    computedGameInfoCardStyle(): StyleValue{
      return {
        height: `${this.dimensionsInPx}px`,
        margin: `0px ${this.borderThickness/2}px`,
      }
    },
    activePlayerName(){
      const gameStore = this.getGameStore();
      if(gameStore.currentGame === undefined)
      {
        return "";
      }
      return gameStore.currentGame._playerNames[gameStore.currentGame._currentPlayer];
    },
    activePlayer(){
      return this.getGameStore().currentGame?._currentPlayer
    },
    playerNames() {
      return this.getGameStore().currentGame?._playerNames
    },
    undoPossible() {
      const gameStore = this.getGameStore();
      return (gameStore.currentGame?._history?.moves?.length ?? 0) >= (gameStore.currentGame?._singlePlayer ? 1 : 2)
    },
    redoPossible(){
      return (this.getGameStore().currentGame?._history?.revertedMoves?.length ?? 0) >= 1
    },
    requestToAnswer(){
      const gameStore = this.getGameStore();
      if(gameStore.currentGame === undefined)
        return false;

      return gameStore.currentGame._permissionRequest !== PermissionRequest.Nothing &&
          gameStore.currentGame._permissionRequest !== PermissionRequest.Exit
    },
    localGame(){
      return this.getGameStore().currentGame?._singlePlayer ?? true;
    },
    playerNameInfo()
    {
      return this.$t(`player.${this.activePlayer}`, {name: this.activePlayerName})
    },
    playerNameColor(): StyleValue{
      if(this.getGameStore().currentGame?._singlePlayer)
        return {}
      let color = ""
      if(this.getGameStore().currentGame?._ownColor == this.getGameStore().currentGame?._currentPlayer)
        color = this.getColor()
      return {
        color: color
      }
    }

  }
})
</script>

<template>
  <v-card
      class="ml-game-info-card flexcard"
      :style="computedGameInfoCardStyle"
  >
    <v-card-title
        class="ml-game-info-title"
    >
      <v-row
        class="align-center"
      >
        <v-col
            cols="10"
            sm="6"
            class="text-sm-body-1"
            :style="playerNameColor"
        >
          {{ playerNameInfo }}
        </v-col>
        <v-col
          class="ml-dialog-title-btn-group"
        >
          <font-awesome-btn
              class="me-3"
              :icon="['fas', 'fa-edit']"
              color="lighten1"
              :active="gameSettingsVisible"
              @click="() => {gameSettingsVisible=!gameSettingsVisible; settingsVisible=false}"
          />

          <font-awesome-btn
              :icon="['fas', 'fa-gears']"
              color="lighten1"
              :active="settingsVisible"
              @click="() => {settingsVisible = !settingsVisible; gameSettingsVisible=false}"

          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text
        class="grow mt-4"
    >
      <settings
          col-size="12"
          v-if="settingsVisible"
          :in-game="true"
          @close-settings="settingsVisible=false"
      />
      <game-settings
          :local="localGame"
          v-else-if="gameSettingsVisible"
          @leave-game-settings="gameSettingsVisible=false"
          v-bind:player-names="{...playerNames}"
          :is-game-dialog="false"
      />
      <moves
          v-else
      />
    </v-card-text>
    <v-card-actions
        class="ml-game-info-card-actions"
    >
      <v-container
          class="container"
      >
        <v-row>
          <v-col
              class="ml-game-info-card-actions-column"
              cols="6"
          >
            <v-font-awesome-btn
                @click="getGameStore().requestUndo()"
                :disabled="!undoPossible || requestToAnswer"
                :icon="['fas', 'fa-undo']"
                icon-size="lg"
                :icon-color="getColor()"
                :text="$t('undo')"
            />
          </v-col>
          <v-col
              class="ml-game-info-card-actions-column"
              cols="6"
          >
            <v-font-awesome-btn
                @click="getGameStore().requestRedo()"
                :disabled="!redoPossible || requestToAnswer"
                :icon="['fas', 'fa-redo']"
                icon-size="lg"
                :icon-color="getColor()"
                :text="$t('redo')"
            />

          </v-col>

        </v-row>
        <v-row
            align-content="center"
            justify="center"
        >
          <v-col
              class="ml-game-info-card-actions-column"
              cols="6"
          >
            <v-font-awesome-btn
                :disabled="requestToAnswer"
                :icon="['fas', 'fa-handshake']"
                iconSize="lg"
                :icon-color="getColor()"
                :text="$t('draw')"
                @click="getGameStore().requestDraw()"
            />
          </v-col>
          <v-col
              class="ml-game-info-card-actions-column"
              cols="6"
          >
            <v-font-awesome-btn
                :disabled="requestToAnswer"
                @click="$emit('leaveRequest')"
                :icon="['fas', 'sign-out-alt']"
                iconSize="lg"
                :text="$t('leave_game')"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card-actions>
  </v-card>
</template>

<style scoped lang="scss">
@import "@/scss/ml-dialog";
@import "@/scss/flexcard";

.ml-game-info-card{
  width: 100%;
  box-shadow: 0 0 32px 2px rgba(54,54,54,1);

  .ml-game-info-card-content{
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    vertical-align: center;
    align-content: center;
    align-items: center;
    overflow: auto;
  }
  .ml-game-info-card-actions{
    .ml-game-info-card-actions-column{
      display: flex;
      justify-content: center;
    }
  }
}
</style>