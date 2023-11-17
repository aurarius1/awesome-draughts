<script lang="ts">
import {defineComponent, renderList} from 'vue'
import NameSelection from "@/components/GameSettings/NameSelection.vue";
import {PlayerNames} from "@/draughts";
import {PropType} from "vue";
import {useGameStore} from "@/store";

export default defineComponent({
  name: "LocalGameSettings",
  emits: {
    leaveGameSettings(){return true;}
  },
  watch: {
    startNewGame(startGame){
      if(startGame)
      {
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
  components: {NameSelection},
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
      const gameStore = useGameStore()
      // TODO
      //gameStore.currentGame.changePlayerName(playerType, playerName);
    }
  }
})
</script>

<template>
  <name-selection
      v-bind:default-names="_playerNames"
      @player-name-changed="changePlayerName"
  />
  <v-btn
      v-if="!isGameDialog"
      @click="$emit('leaveGameSettings')"
      :color="getColorStore().currentColor.accent1"
      class="ml-leave-game-settings"
  >
    {{ this.$t("exit_game_settings") }}
  </v-btn>
</template>

<style scoped lang="scss">
.ml-leave-game-settings
{
  margin-top: 12px;
}
</style>