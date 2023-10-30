<script lang="ts">
import GameField from "@/components/Draughts/GameField.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {StyleValue} from "vue";
import {LeaveTypes} from '@/globals.ts'
import FontAwesomeBtn from "@/components/FontAwesomeBtn.vue";
import VFontAwesomeBtn from "@/components/VFontAwesomeBtn.vue";

export default defineComponent({
  name: "Game.vue",
  components: {VFontAwesomeBtn, FontAwesomeBtn, FontAwesomeIcon, GameField},
  setup()
  {
    const colorStore = useColorStore();
    const toast = useToast();
    return {getColorStore: colorStore, toast}
  },
  data()
  {
    return{
      currentPlayer: "",
      playerWantsToLeave: false,
      exitType: LeaveTypes.noLeave,
      undoRequest: false,
      redoRequest: false,
      undoPossible: false,
      redoPossible: false,
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
    setCurrentPlayer(player: string) {
      this.currentPlayer = player
    },
    undoServed(player: string) {
      this.undoRequest = false
      this.setCurrentPlayer(player)
    },
    redoServed(player: string) {
      this.redoRequest = false
      this.setCurrentPlayer(player)
    },
    getPlayerName(player: string = "") {
      if(player === "")
      {
        player = this.currentPlayer
      }
      if(player === "white" )
      {
        return "Alice"
      }
      return "Bob"
    },
    gameOver(winner: string) {

      this.toast.success(this.$t(`player.wins`, {name: this.getPlayerName(winner)}))
      this.$router.push("/")
    },
  },
  computed:
  {
    infoCardContainerStyle(): StyleValue{
      return {
        height: "992px",
        width: "600px",
        backgroundColor: this.getColor('lighten3'),
        borderRadius: "4px"

      }
    }

  }
})
</script>

<template>
  <v-dialog
    v-model="playerWantsToLeave"
    width="500"
  >
    <v-card
      class="ml-save-dialog"
    >
      <v-card-title>
        <v-row>
          <v-col
            cols="11"
          >
            {{ $t('exit_dialog.title')}}
          </v-col>
          <v-col>
            <font-awesome-btn
                :icon="['fas', 'fa-close']"
                @click="playerWantsToLeave=false"
            />
          </v-col>
        </v-row>

      </v-card-title>
      <v-card-text
        class="ml-save-dialog-text"
      >
        {{ $t('exit_dialog.description') }}
      </v-card-text>
      <v-card-actions
        class="ml-save-dialog-actions"
      >
        <v-tooltip
            :text="$t('exit_dialog.tooltips.save_local')"
        >
          <template v-slot:activator="{ props }">

            <v-font-awesome-btn
                v-bind="props"
                :btn-color="getColor()"
                btn-variant="outlined"
                @click="leaveAndSaveLocal()"
                :icon="['fas', 'fa-download']"
                size="lg"
                :text="$t('exit_dialog.save')"
                icon-text-spacing="me-2"
            />
          </template>

        </v-tooltip>
        <v-tooltip
          :text="$t('exit_dialog.tooltips.save_remote')"
        >
          <template v-slot:activator="{ props }">

            <v-font-awesome-btn
                v-bind="props"
                :btn-color="getColor()"
                btn-variant="elevated"
                @click="leaveAndSaveRemote()"
                :icon="['fas', 'fa-cloud-upload-alt']"
                size="lg"
                :text="$t('exit_dialog.save')"
                icon-text-spacing="me-2"
            />
          </template>
        </v-tooltip>
        <v-tooltip
            :text="$t('exit_dialog.tooltips.exit')"
        >
          <template v-slot:activator="{ props }">

            <v-font-awesome-btn
                v-bind="props"
                :btn-color="getColor()"
                btn-variant="plain"
                @click="leaveGame()"
                :icon="['fas', 'fa-sign-out-alt']"
                size="lg"
                :text="$t('exit_dialog.exit')"
                icon-text-spacing="me-2"
            />

          </template>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>


  <div
    class="ml-game-container"
  >
    <game-field
      :leave="exitType"
      card-height="992px"
      @player-switched="setCurrentPlayer"
      @undo-served="undoServed"
      @redo-served="redoServed"
      @undo-possible="(possible: boolean) => {undoPossible=possible}"
      @redo-possible="(possible: boolean) => {redoPossible=possible}"
      @game-over="gameOver"
      :undo-request="undoRequest"
      :redo-request="redoRequest"
    />
    <div
      class="ml-game-info-card-container ml-12"
      :style="infoCardContainerStyle"
    >
      <v-card
          class="ml-game-info-card"
      >
        <v-card-title
            class="ml-game-info-title"
        >
         <v-row>
           <v-col
               cols="10"
           >
             {{ $t(`player.${currentPlayer}`, {name: getPlayerName()}) }}
           </v-col>
           <v-col>
             <font-awesome-btn
                :icon="['fas', 'fa-edit']"
                color="lighten1"
                @click="() => {console.log('hallo')}"
             />
           </v-col>
           <v-col>
             <font-awesome-btn
                 :icon="['fas', 'fa-gears']"
                 color="lighten1"
                 @click="() => {console.log('yes that works')}"
             />
           </v-col>
         </v-row>
        </v-card-title>
        <v-card-text
            class="ml-game-info-card-content"
        >

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
              >
                <v-font-awesome-btn
                  @click="undoRequest=true"
                  :disabled="undoRequest || !undoPossible"
                  :icon="['fas', 'fa-undo']"
                  size="lg"
                  :icon-color="getColor()"
                  :text="$t('undo')"
                />
              </v-col>
              <v-col
                  class="ml-game-info-card-actions-column"
              >
                <v-font-awesome-btn
                    @click="redoRequest=true"
                    :disabled="redoRequest || !redoPossible"
                    :icon="['fas', 'fa-redo']"
                    size="lg"
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
              >
                <v-font-awesome-btn
                    :icon="['fas', 'fa-handshake']"
                    size="lg"
                    :icon-color="getColor()"
                    :text="$t('draw')"
                />
              </v-col>
              <v-col
                  class="ml-game-info-card-actions-column"
              >

                <v-font-awesome-btn
                    @click="playerWantsToLeave=true"
                    :icon="['fas', 'sign-out-alt']"
                    size="lg"
                    :text="$t('leave_game')"
                />
              </v-col>
            </v-row>
          </v-container>


        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>

<style scoped lang="scss">


.ml-game-container{
  display: flex;
  height: calc(100vh - 56px);
  align-items: center;
  top: 56px;
  justify-content: center;
  overflow-y: hidden;
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

.ml-game-info-card-container{
  display: flex;
  justify-content: center;
  align-content: center;
  .ml-game-info-card{
    margin: 16px;
    width: 568px;
    box-shadow: 0px 0px 32px 2px rgba(54,54,54,1);
    .ml-game-info-title{
      display: flex;
      justify-content: center;
    }
    .ml-game-info-card-content{
      height: 780px;
    }
    .ml-game-info-card-actions{
      .ml-game-info-card-actions-column{
        display: flex;
        justify-content: center;
      }
    }


  }

}


</style>
