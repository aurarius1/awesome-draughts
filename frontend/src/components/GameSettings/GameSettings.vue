<script lang="ts">
import {defineComponent, renderList} from 'vue'
import {PlayerNames} from "@/draughts";
import {PropType} from "vue";
import {useGameStore} from "@/store";
import SelectionRow from "@/components/GameSettings/SelectionRow.vue";

export default defineComponent({
  name: "GameSettings",
  emits: {
    leaveGameSettings(){return true;},
    startNotPossible(){return true;}
  },
  watch: {
    startNewGame(startGame){
      if(startGame)
      {
        const gameStore = useGameStore();
        if(this.local)
        {
          if(this._playerNames.white.length <= 0 || this._playerNames.black.length <= 0)
          {
            this.$emit("startNotPossible");
            return;
          }
          gameStore.startNewGame(10, this._playerNames)
          this.$router.replace('game')
        }
        else
        {
          if(this._playerNames[this.player].length <= 0)
          {
            this.$emit("startNotPossible");
            return;
          }
          gameStore.startNewRemoteGame(10, this.player, this._playerNames[this.player]);
          this.$router.replace("/waiting");
        }

      }
    },
    playerNames(newValue){
      this._playerNames = newValue;
    },
    local()
    {
      this.player="white"
      this._playerNames = {
        "white": "Alice",
        "black": "Bob"
      }
    }
  },
  setup()
  {
    const colorStore = useColorStore()
    return {colorStore}
  },
  components: {SelectionRow},
  props: {
    playerNames: {
      type: Object as PropType<PlayerNames>,
      default: {
        "white": "Alice",
        "black": "Bob"
      }
    },
    local: {
      type: Boolean,
      default: true,
    },
    isGameDialog: {
      type: Boolean,
      default: true,
    },
    startNewGame: {
      type: Boolean,
      default: false,
    }
  },
  data(){
    return{
      player: "white",
      _playerNames: this.playerNames
    }
  },
  computed: {
    playerColor(){
      if(this.isGameDialog)
        return this.player;
      const gameStore = useGameStore();
      return gameStore.currentGame?._ownColor ?? "white";
    }
  },
  methods: {
    renderList,
    getColorStore()
    {
      return this.colorStore
    },
    changePlayerName(playerType: string, playerName: string){
      this._playerNames[playerType] = playerName;
    },
    switchPlayer()
    {
      if(!this.isGameDialog)
      {
        return;
      }
      this.player = (this.player == 'white' ? 'black' : 'white')
    },
    saveGameSettings(){
      const gameStore = useGameStore();
      if(this.local)
        gameStore.renamePlayer(this._playerNames["white"], this._playerNames["black"])
      else
        gameStore.renamePlayer(this._playerNames[this.playerColor])
      this.$emit('leaveGameSettings')
    },
  }
})
</script>

<template>

  <selection-row
      :remote="!local"
      :player="playerColor"
      :name="_playerNames[playerColor]"
      class="ml-name-selection"
      @switch-player="switchPlayer()"
      @player-name-changed="changePlayerName"
  />
  <selection-row
      v-if="local"
      player="black"
      :name="_playerNames.black"
      class="ml-name-selection"
      @player-name-changed="changePlayerName"
  />
  <div
    class="ml-settings-actions"
  >
    <v-btn
        v-if="!isGameDialog"
        @click="$emit('leaveGameSettings')"
        :color="getColorStore().currentColor.accent1"
        class="ml-leave-game-settings"
    >
      {{ $t("game_settings.exit") }}
    </v-btn>
    <v-btn
        v-if="!isGameDialog"
        :color="getColorStore().currentColor.accent1"
        class="ml-leave-game-settings"
        @click="saveGameSettings()"
    >
      {{ $t("game_settings.save") }}
    </v-btn>
  </div>
</template>

<style scoped lang="scss">
.ml-leave-game-settings
{
  margin-top: 12px;
}

.ml-settings-actions{
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>