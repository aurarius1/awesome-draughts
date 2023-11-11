<script lang="ts">
import {defineComponent, renderList} from 'vue'
import NameSelection from "@/components/GameSettings/NameSelection.vue";
import {PlayerNames} from "@/draughts";
import {PropType} from "vue";
import SelectionRow from "@/components/GameSettings/SelectionRow.vue";
import {useGameStore} from "@/store";

export default defineComponent({
  name: "RemoteGameSettings",
  emits: {
    leaveGameSettings(){return true;}
  },
  watch: {
    startNewGame(startGame){
      if(startGame)
      {
        const gameStore = useGameStore();
        gameStore.startNewRemoteGame(10, this.player, this._playerNames[this.player]);
        console.log(this._playerNames);

        this.$router.replace("/waiting");
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
  components: {SelectionRow, NameSelection},
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
      player: "white",
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
  }
})
</script>

<template>

  <selection-row
      :remote="true"
      :player="player"
      :name="this._playerNames[player]"
      class="ml-name-selection"
      @switch-player="player = (player == 'white' ? 'black' : 'white')"
      @player-name-changed="(_, newName) => this._playerNames[player] = newName"
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