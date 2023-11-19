<script lang="ts">
import {defineComponent, renderList} from 'vue'
import {PlayerNames} from "@/draughts";
import {PropType} from "vue";
import {useGameStore} from "@/store";
import SelectionRow from "@/components/GameSettings/SelectionRow.vue";

export default defineComponent({
  name: "LocalGameSettings",
  emits: {
    leaveGameSettings(){return true;},
    startNotPossible(){return true;}
  },
  watch: {
    startNewGame(startGame){
      if(startGame)
      {
        if(this._playerNames.white.length <= 0 || this._playerNames.black.length <= 0)
        {
          this.$emit("startNotPossible");
          return;
        }


        const gameStore = useGameStore();
        gameStore.startNewGame(10, this._playerNames)
        this.$router.replace('game')
      }
    },
    playerNames(newValue){
      this._playerNames = newValue;
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
      _playerNames: this.playerNames
    }
  },
  computed: {
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
    saveGameSettings(){
      const gameStore = useGameStore();
      gameStore.renamePlayer(this._playerNames["white"], this._playerNames["black"])
      this.$emit('leaveGameSettings')
    },
  }
})
</script>

<template>

  <selection-row
      player="white"
      :name="_playerNames.white"
      class="ml-name-selection"
      @player-name-changed="changePlayerName"
  />
  <selection-row
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