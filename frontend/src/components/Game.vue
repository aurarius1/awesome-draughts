<script lang="ts">
import GameField from "@/components/Draughts/GameField.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {StyleValue} from "vue";

export default defineComponent({
  name: "Game.vue",
  components: {FontAwesomeIcon, GameField},
  setup()
  {
    const colorStore = useColorStore();
    return {colorStore}
  },
  data()
  {
    return{
      currentPlayer: "",
      playerWantsToLeave: false,
      dialogCloseHover: false,
      exitType: -1,
    }
  },
  methods: {
    leaveGame(exitType: number)
    {
      this.exitType = exitType
    },
    getColor()
    {
        return this.colorStore.currentColor.lighten1
    },
    setCurrentPlayer(player: string)
    {
      this.currentPlayer = player
    }
  },
  computed:
  {
    dialogCloseHoverStyle(): StyleValue{
      if(!this.dialogCloseHover)
        return {}

      return {
        cursor: "pointer",
        color: this.getColor()
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
    <v-card>
      <v-card-title>
        <v-row>
          <v-col
            cols="11"
          >
            {{ $t('save_or_exit')}}
          </v-col>
          <v-col>
            <font-awesome-icon
                :icon="['fas', 'fa-close']"
                @mouseover="dialogCloseHover=true"
                @mouseleave="dialogCloseHover=false"
                :style="dialogCloseHoverStyle"
                @click="playerWantsToLeave=false"
            />
          </v-col>
        </v-row>

      </v-card-title>
      <v-card-text>
        {{ $t('save_or_exit_desc') }}
      </v-card-text>
      <v-card-actions

      >
        <v-tooltip
            :text="$t('save_locally_tooltip')"
        >
          <template v-slot:activator="{ props }">
            <v-btn
                :color="getColor()"
                variant="outlined"
                v-bind="props"
                @click="leaveGame(1)"
            >
              {{ $t('save_locally') }}
            </v-btn>
          </template>

        </v-tooltip>
        <v-tooltip
          :text="$t('save_remote_tooltip')"
        >
          <template v-slot:activator="{ props }">
            <v-btn
                :color="getColor()"
                variant="elevated"
                v-bind="props"
                @click="leaveGame(2)"
            >
              {{ $t('save_remote') }}
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip
            :text="$t('exit_tooltip')"
        >
          <template v-slot:activator="{ props }">
            <v-btn
                :color="getColor()"
                variant="plain"
                v-bind="props"
                @click="leaveGame(3)"
            >
              {{ $t('exit') }}
            </v-btn>
          </template>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>


  <div
    class="ml-game-container"
  >
    <game-field
      :leave="this.exitType"
      @player-switched="setCurrentPlayer"
    />
    <v-card

      width="300px"
      elevation="6"
      class="ml-12"
    >
      <v-card-title
          class="ml-title-row"
      >
        {{ $t(`player.${currentPlayer}`)}}
      </v-card-title>
      <v-card-text>

      </v-card-text>
      <v-card-actions
      >
        <v-btn
          @click="playerWantsToLeave=true"
        >
          <font-awesome-icon
              :icon="['fas', 'sign-out-alt']"
              size="lg"
              class="me-4"
          />
          {{ $t("leave_game") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped lang="scss">
.ml-game-container{
  display: flex;
  height: calc(100vh - 56px);
  align-items: center;
  top: 56px;
  justify-content: center;
}
.v-card-actions{
  display: flex;
  justify-content: space-evenly;
}
.ml-title-row{
  display: flex;
  justify-content: center;
}

.ml-save-dialog{
  display: flex;
  justify-content: space-evenly;
}

</style>