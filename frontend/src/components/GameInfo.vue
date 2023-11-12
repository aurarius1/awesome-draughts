<script lang="ts">
import {defineComponent, PropType, StyleValue} from 'vue'
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";
import Moves from "@/components/Draughts/Moves.vue";
import Settings from "@/components/Settings.vue";
import FontAwesomeBtn from "@/components/Buttons/FontAwesomeBtn.vue";
import LocalGameSettings from "@/components/GameSettings/LocalGameSettings.vue";
import {PlayerNames} from "@/draughts";
import {heightBreakpoints} from "@/globals.ts";
import {useGameStore} from "@/store";

export default defineComponent({
  name: "GameInfo",
  components: {LocalGameSettings, FontAwesomeBtn, Settings, Moves, VFontAwesomeBtn},
  emits: {
    leaveRequest(){
      return true
    },
    undoRequest(){
      return true
    },
    redoRequest(){
      return true
    },
  },
  setup()
  {
    const colorStore = useColorStore();
    return {colorStore}
  },
  props: {
    undoPossible: {
      type: Boolean,
      required: true
    },
    redoPossible:{
      type: Boolean,
      required: true
    },
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
    }
  },
  computed: {
    computedGameInfoCardStyle(): StyleValue{
      return {
        height: `${this.dimensionsInPx}px`,
        margin: `0px ${this.borderThickness/2}px`,
      }
    },
    computedGameInfoTextStyle(): StyleValue{
      return {
        height: `${this.dimensionsInPx*heightBreakpoints()}px`,
      }
    },
    activePlayerName(){
      const gameStore = useGameStore()
      return gameStore._currentApiGame?._playerNames[gameStore._currentApiGame?._currentPlayer];
    },
    activePlayer(){
      const gameStore = useGameStore()
      return gameStore._currentApiGame?._currentPlayer
    },
    playerNames() {
      const gameStore = useGameStore()
      return gameStore._currentApiGame?._playerNames
    },
    currentBreakpoint(){
      return this.$vuetify.display.name;
    }
  }
})
</script>

<template>
  <v-card
      class="ml-game-info-card"
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
        >
          {{ $t(`player.${activePlayer}`, {name: activePlayerName}) }}
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
        class="ml-game-info-card-content"
        :style="computedGameInfoTextStyle"
    >
      <settings
          col-size="12"
          v-if="settingsVisible"
          :in-game="true"
          @close-settings="settingsVisible=false"
      />
      <local-game-settings
          v-else-if="gameSettingsVisible"
          @leave-game-settings="gameSettingsVisible=false"
          v-bind:player-names="playerNames"
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
                @click="$emit('undoRequest')"
                :disabled="undoPossible"
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
                @click="$emit('redoRequest')"
                :disabled="redoPossible"
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
                :icon="['fas', 'fa-handshake']"
                iconSize="lg"
                :icon-color="getColor()"
                :text="$t('draw')"
                @click="$emitter.emit('draw')"
            />
          </v-col>
          <v-col
              class="ml-game-info-card-actions-column"
              cols="6"
          >
            <v-font-awesome-btn
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


.ml-game-info-card{
  width: 100%;
  box-shadow: 0px 0px 32px 2px rgba(54,54,54,1);

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