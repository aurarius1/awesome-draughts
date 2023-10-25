<script lang="ts">
import GameField from "@/components/Draughts/GameField.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

export default defineComponent({
  name: "Game.vue",
  components: {FontAwesomeIcon, GameField},
  data()
  {
    return{
      currentPlayer: "",
    }
  },
  methods: {
    leaveGame()
    {
      // TODO IMPLEMENT
      console.log("LEAVING")
    },
    setCurrentPlayer(player)
    {
      this.currentPlayer = player
      console.log(player)
    }
  }
})
</script>

<template>
  <div
    class="ml-game-container"
  >
    <game-field
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
        exit
      </v-card-text>
      <v-card-actions
      >
        <v-btn
          @click="leaveGame()"
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
</style>